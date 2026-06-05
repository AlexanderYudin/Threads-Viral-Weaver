import type { ThreadsPost, SearchParams } from './types'
import { periodToSince } from './scoring'
import { generateDemoPosts } from './demo-data'

interface ProviderOutput {
  posts: ThreadsPost[]
  metricsAvailable: boolean
  notes: string[]
}

// ---------- DEMO ----------
export function demoProvider(params: SearchParams): ProviderOutput {
  const posts = generateDemoPosts(params.keywords, params.limit, params.period)
  return {
    posts,
    metricsAvailable: true,
    notes: [
      'Демо-режим: данные сгенерированы для проверки интерфейса и логики ER/виральности.',
    ],
  }
}

// ---------- ОФИЦИАЛЬНЫЙ THREADS API ----------
// Keyword Search: https://graph.threads.net/v1.0/keyword_search
// Возвращает текст/автора/время, НО не отдаёт лайки/просмотры чужих постов.
export async function officialProvider(
  params: SearchParams
): Promise<ProviderOutput> {
  if (!params.token) {
    return {
      posts: [],
      metricsAvailable: false,
      notes: ['Не указан access token для официального Threads API.'],
    }
  }

  const since = periodToSince(params.period)
  const fields =
    'id,text,media_type,permalink,timestamp,username,has_replies,is_quote_post,is_reply'
  const allPosts: ThreadsPost[] = []
  const notes: string[] = []

  for (const kw of params.keywords) {
    const url = new URL('https://graph.threads.net/v1.0/keyword_search')
    url.searchParams.set('q', kw)
    url.searchParams.set('search_type', params.searchType)
    url.searchParams.set('fields', fields)
    url.searchParams.set('limit', String(Math.min(100, params.limit)))
    if (since) url.searchParams.set('since', String(since))
    url.searchParams.set('access_token', params.token)

    try {
      const res = await fetch(url.toString())
      const data: any = await res.json()
      if (data.error) {
        notes.push(`Ошибка API для «${kw}»: ${data.error.message}`)
        continue
      }
      for (const item of data.data || []) {
        allPosts.push({
          id: item.id,
          text: item.text || '',
          username: item.username || 'unknown',
          permalink: item.permalink || '',
          timestamp: item.timestamp || new Date().toISOString(),
          mediaType: item.media_type || 'TEXT',
          // Официальный API не отдаёт метрики чужих постов
          likes: null,
          replies: null,
          reposts: null,
          quotes: null,
          views: null,
        })
      }
    } catch (e: any) {
      notes.push(`Сбой запроса для «${kw}»: ${e.message}`)
    }
  }

  notes.push(
    'Официальный Threads API не отдаёт метрики вовлечённости (лайки/просмотры) для чужих постов — ER и виральность недоступны. Для метрик используйте провайдер ScrapeCreators или EnsembleData.'
  )

  return { posts: allPosts, metricsAvailable: false, notes }
}

// ---------- SCRAPECREATORS (неофициальный, с метриками) ----------
// https://api.scrapecreators.com/v1/threads/search?query=...  (header: x-api-key)
// Ответ: { success, credits_remaining, posts: [...] }
export async function scrapeCreatorsProvider(
  params: SearchParams
): Promise<ProviderOutput> {
  // Ключ: из запроса (введён пользователем) или дефолтный из окружения сервера
  const envKey =
    typeof process !== 'undefined' ? process.env?.SCRAPECREATORS_API_KEY : undefined
  const token = params.token || envKey
  if (!token) {
    return {
      posts: [],
      metricsAvailable: false,
      notes: ['Не указан API-ключ ScrapeCreators (x-api-key).'],
    }
  }
  const allPosts: ThreadsPost[] = []
  const notes: string[] = []
  let creditsLeft: number | undefined

  for (const kw of params.keywords) {
    const url = new URL('https://api.scrapecreators.com/v1/threads/search')
    url.searchParams.set('query', kw)
    try {
      const res = await fetch(url.toString(), {
        headers: { 'x-api-key': token },
      })
      // Устойчивый парсинг: при ошибке API отдаёт текст ("Not Found"), не JSON
      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        notes.push(
          `Сбой ScrapeCreators для «${kw}»: HTTP ${res.status} — ${text.slice(0, 120)}`
        )
        continue
      }
      if (!res.ok || data.success === false) {
        notes.push(
          `Ошибка ScrapeCreators для «${kw}»: ${data.message || data.error || `HTTP ${res.status}`}`
        )
        continue
      }
      if (typeof data.credits_remaining === 'number') creditsLeft = data.credits_remaining
      const items = data.posts || data.searchResults || data.data || data.results || []
      for (const raw of items) {
        const t = raw.thread_items?.[0]?.post || raw.post || raw
        allPosts.push(normalizeGeneric(t))
      }
    } catch (e: any) {
      notes.push(`Сбой ScrapeCreators для «${kw}»: ${e.message}`)
    }
  }
  if (creditsLeft !== undefined) {
    notes.push(`ScrapeCreators: осталось кредитов — ${creditsLeft}.`)
  }
  return { posts: allPosts, metricsAvailable: true, notes }
}

// ---------- ENSEMBLEDATA (неофициальный, с метриками) ----------
// https://ensembledata.com/apis/threads/keyword-search
export async function ensembleDataProvider(
  params: SearchParams
): Promise<ProviderOutput> {
  if (!params.token) {
    return {
      posts: [],
      metricsAvailable: false,
      notes: ['Не указан token EnsembleData.'],
    }
  }
  const allPosts: ThreadsPost[] = []
  const notes: string[] = []

  for (const kw of params.keywords) {
    const url = new URL('https://ensembledata.com/apis/threads/keyword-search')
    url.searchParams.set('name', kw)
    url.searchParams.set('token', params.token)
    try {
      const res = await fetch(url.toString())
      const data: any = await res.json()
      const items = data.data || []
      for (const raw of items) {
        allPosts.push(normalizeGeneric(raw))
      }
    } catch (e: any) {
      notes.push(`Сбой EnsembleData для «${kw}»: ${e.message}`)
    }
  }
  return { posts: allPosts, metricsAvailable: true, notes }
}

// Универсальный нормализатор для неофициальных провайдеров (структуры близки к веб-формату Threads)
function normalizeGeneric(raw: any): ThreadsPost {
  const user = raw.user || raw.author || {}
  const caption = raw.caption?.text || raw.text || raw.caption || ''
  const code = raw.code || raw.shortcode || ''
  const username = user.username || raw.username || 'unknown'
  return {
    id: String(raw.pk || raw.id || code || Math.random()),
    text: typeof caption === 'string' ? caption : caption?.text || '',
    username,
    displayName: user.full_name || user.fullName,
    avatarUrl: user.profile_pic_url || user.profilePicUrl,
    permalink: code
      ? `https://www.threads.net/@${username}/post/${code}`
      : `https://www.threads.net/@${username}`,
    timestamp: raw.taken_at
      ? new Date(raw.taken_at * 1000).toISOString()
      : raw.timestamp || new Date().toISOString(),
    mediaType:
      raw.media_type === 2 || raw.video_versions?.length
        ? 'VIDEO'
        : raw.media_type === 8 || raw.carousel_media?.length
        ? 'CAROUSEL'
        : raw.image_versions2?.candidates?.length
        ? 'IMAGE'
        : 'TEXT',
    likes: raw.like_count ?? raw.likes ?? null,
    replies: raw.reply_count ?? raw.text_post_app_info?.direct_reply_count ?? raw.replies ?? null,
    reposts: raw.repost_count ?? raw.text_post_app_info?.repost_count ?? raw.reposts ?? null,
    quotes: raw.quote_count ?? raw.text_post_app_info?.quote_count ?? raw.quotes ?? null,
    views: raw.view_count ?? raw.views ?? null,
    followers: user.follower_count ?? null,
  }
}
