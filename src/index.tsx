import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import type { SearchParams, SearchResult, ThreadsPost } from './types'
import { enrichPost, sortPosts, periodToSince } from './scoring'
import {
  demoProvider,
  officialProvider,
  scrapeCreatorsProvider,
  ensembleDataProvider,
} from './providers'
import { HomePage } from './page'

const app = new Hono()

app.use('/api/*', cors())
app.use(renderer)

// ---------- API: поиск ----------
app.post('/api/search', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Невалидный JSON' }, 400)
  }

  const keywords: string[] = (body.keywords || [])
    .map((k: string) => String(k).trim())
    .filter(Boolean)

  if (keywords.length === 0) {
    return c.json({ error: 'Укажите хотя бы одно ключевое слово' }, 400)
  }

  const params: SearchParams = {
    keywords,
    provider: body.provider || 'demo',
    searchType: body.searchType === 'RECENT' ? 'RECENT' : 'TOP',
    period: ['24h', '7d', '30d', 'all'].includes(body.period)
      ? body.period
      : '24h',
    mediaType: body.mediaType || 'ALL',
    minViral: Number(body.minViral) || 0,
    sortBy: ['viral', 'er', 'likes', 'recent'].includes(body.sortBy)
      ? body.sortBy
      : 'viral',
    limit: Math.min(100, Math.max(5, Number(body.limit) || 30)),
    token: body.token ? String(body.token) : undefined,
  }

  let out
  try {
    switch (params.provider) {
      case 'official':
        out = await officialProvider(params)
        break
      case 'scrapecreators':
        out = await scrapeCreatorsProvider(params)
        break
      case 'ensembledata':
        out = await ensembleDataProvider(params)
        break
      case 'demo':
      default:
        out = demoProvider(params)
        break
    }
  } catch (e: any) {
    return c.json({ error: `Ошибка провайдера: ${e.message}` }, 500)
  }

  const now = Date.now()
  const since = periodToSince(params.period, now)

  // Обогащение метриками + фильтры
  let posts: ThreadsPost[] = out.posts
    .map((p) => enrichPost(p, now))
    .filter((p) => {
      // период
      if (since) {
        const ts = new Date(p.timestamp).getTime() / 1000
        if (ts < since) return false
      }
      // тип медиа
      if (params.mediaType && params.mediaType !== 'ALL') {
        if (p.mediaType !== params.mediaType) return false
      }
      // минимальный viral score
      if (params.minViral && (p.viralScore ?? 0) < params.minViral) return false
      return true
    })

  posts = sortPosts(posts, params.sortBy).slice(0, params.limit)

  const result: SearchResult = {
    provider: params.provider,
    query: keywords.join(', '),
    total: posts.length,
    metricsAvailable: out.metricsAvailable,
    posts,
    notes: out.notes,
  }

  return c.json(result)
})

// Главная страница
app.get('/', (c) => {
  return c.render(<HomePage />)
})

export default app
