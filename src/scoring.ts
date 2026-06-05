import type { ThreadsPost } from './types'

/**
 * Расчёт вовлечённости, ER и viral score для поста.
 *
 * ER (engagement rate):
 *  - Если известно число просмотров (views) → ER = engagement / views * 100
 *  - Иначе, если известно число подписчиков → ER = engagement / followers * 100
 *  - Иначе ER = null (метрик недостаточно)
 *
 * Viral score — нормированный показатель «залётности», учитывает:
 *  - абсолютную вовлечённость (логарифмически, чтобы топ-посты не «забивали» шкалу)
 *  - скорость набора (вовлечённость в час с момента публикации)
 *  - качество (ER, если доступен)
 */
export function enrichPost(post: ThreadsPost, now = Date.now()): ThreadsPost {
  const likes = post.likes ?? 0
  const replies = post.replies ?? 0
  const reposts = post.reposts ?? 0
  const quotes = post.quotes ?? 0

  const hasMetrics =
    post.likes !== null ||
    post.replies !== null ||
    post.reposts !== null ||
    post.quotes !== null

  const engagement = likes + replies + reposts + quotes

  // Возраст поста в часах
  const ts = new Date(post.timestamp).getTime()
  const ageHours = Math.max(0.5, (now - ts) / (1000 * 60 * 60))

  // ER
  let er: number | null = null
  if (hasMetrics) {
    if (post.views && post.views > 0) {
      er = (engagement / post.views) * 100
    } else if (post.followers && post.followers > 0) {
      er = (engagement / post.followers) * 100
    }
  }

  // Скорость набора вовлечённости (engagement в час)
  const velocity = engagement / ageHours

  // Viral score
  let viralScore = 0
  if (hasMetrics) {
    // Логарифмическая абсолютная вовлечённость: ~0..50
    const absComponent = Math.log10(engagement + 1) * 12
    // Скорость: ~0..30
    const velocityComponent = Math.min(30, Math.log10(velocity + 1) * 15)
    // Качество (ER): ~0..20
    const erComponent = er !== null ? Math.min(20, er * 2) : 0
    viralScore = absComponent + velocityComponent + erComponent
  }

  return {
    ...post,
    engagement: hasMetrics ? engagement : undefined,
    er: er !== null ? Math.round(er * 100) / 100 : null,
    viralScore: Math.round(viralScore * 10) / 10,
    ageHours: Math.round(ageHours * 10) / 10,
  }
}

export function sortPosts(
  posts: ThreadsPost[],
  sortBy: 'viral' | 'er' | 'likes' | 'recent'
): ThreadsPost[] {
  const arr = [...posts]
  switch (sortBy) {
    case 'er':
      arr.sort((a, b) => (b.er ?? -1) - (a.er ?? -1))
      break
    case 'likes':
      arr.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
      break
    case 'recent':
      arr.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      break
    case 'viral':
    default:
      arr.sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0))
      break
  }
  return arr
}

export function periodToSince(period: string, now = Date.now()): number | null {
  const day = 24 * 60 * 60 * 1000
  switch (period) {
    case '24h':
      return Math.floor((now - day) / 1000)
    case '7d':
      return Math.floor((now - 7 * day) / 1000)
    case '30d':
      return Math.floor((now - 30 * day) / 1000)
    case 'all':
    default:
      return null
  }
}
