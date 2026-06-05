// Унифицированный формат поста Threads вне зависимости от провайдера
export interface ThreadsPost {
  id: string
  text: string
  username: string
  displayName?: string
  avatarUrl?: string
  permalink: string
  timestamp: string // ISO
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL' | string
  imageUrl?: string
  // Метрики вовлечённости (могут отсутствовать у официального API)
  likes: number | null
  replies: number | null
  reposts: number | null
  quotes: number | null
  views: number | null
  followers?: number | null // подписчиков у автора (для ER по аудитории)
  // Вычисляемые поля
  engagement?: number // likes + replies + reposts + quotes
  er?: number | null // engagement rate, %
  viralScore?: number // итоговый рейтинг "залётности"
  ageHours?: number // сколько часов прошло с публикации
}

export interface SearchParams {
  keywords: string[] // список ключевых слов
  provider: 'demo' | 'official' | 'scrapecreators' | 'ensembledata'
  searchType: 'TOP' | 'RECENT'
  period: '24h' | '7d' | '30d' | 'all'
  mediaType?: 'ALL' | 'TEXT' | 'IMAGE' | 'VIDEO'
  minViral?: number // минимальный viral score
  sortBy: 'viral' | 'er' | 'likes' | 'recent'
  limit: number
  // credentials передаются в заголовках/теле, не сохраняются
  token?: string
}

export interface SearchResult {
  provider: string
  query: string
  total: number
  metricsAvailable: boolean // есть ли реальные метрики вовлечённости
  posts: ThreadsPost[]
  notes?: string[]
}
