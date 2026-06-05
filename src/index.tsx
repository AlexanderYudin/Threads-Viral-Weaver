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
import {
  verifyGoogleCredential,
  signSession,
  verifySession,
  cookieHeader,
  clearCookieHeader,
  readCookie,
} from './auth'

const app = new Hono()

app.use('/api/*', cors())
app.use(renderer)

// ---------- Авторизация (Google Sign-In, домены Twinby/Neuralab) ----------
app.post('/api/login', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Невалидный JSON' }, 400)
  }
  const credential = body?.credential
  if (!credential) return c.json({ error: 'Нет credential' }, 400)

  const result = await verifyGoogleCredential(String(credential))
  if ('error' in result) return c.json({ allowed: false, error: result.error }, 403)

  const token = signSession(result)
  c.header('Set-Cookie', cookieHeader(token))
  return c.json({ allowed: true, email: result.email, name: result.name, picture: result.picture })
})

app.get('/api/me', (c) => {
  const user = verifySession(readCookie(c.req.header('cookie')))
  if (!user) return c.json({ authed: false })
  return c.json({ authed: true, email: user.email, name: user.name, picture: user.picture })
})

app.post('/api/logout', (c) => {
  c.header('Set-Cookie', clearCookieHeader())
  return c.json({ ok: true })
})

// ---------- API: поиск (только для авторизованных) ----------
app.post('/api/search', async (c) => {
  const user = verifySession(readCookie(c.req.header('cookie')))
  if (!user) return c.json({ error: 'Требуется вход (Twinby/Neuralab)' }, 401)

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

  // Дедуп по id: один пост может попасть под несколько ключевых слов
  const seenIds = new Set<string>()

  // Обогащение метриками + фильтры
  let posts: ThreadsPost[] = out.posts
    .filter((p) => {
      if (!p.id || seenIds.has(p.id)) return false
      seenIds.add(p.id)
      return true
    })
    .map((p) => enrichPost(p, now))
    .filter((p) => {
      // период
      if (since) {
        const ts = new Date(p.timestamp).getTime() / 1000
        if (ts < since) return false
      }
      // тип медиа (карусель считаем картинкой)
      if (params.mediaType && params.mediaType !== 'ALL') {
        const matches =
          params.mediaType === 'IMAGE'
            ? p.mediaType === 'IMAGE' || p.mediaType === 'CAROUSEL'
            : p.mediaType === params.mediaType
        if (!matches) return false
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

// Конфиг для фронта: задан ли дефолтный ключ на сервере
app.get('/api/config', (c) => {
  const hasDefaultKey = !!(
    typeof process !== 'undefined' && process.env?.SCRAPECREATORS_API_KEY
  )
  return c.json({ hasDefaultKey })
})

// Главная страница
app.get('/', (c) => {
  return c.render(<HomePage />)
})

export default app
