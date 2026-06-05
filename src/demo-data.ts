import type { ThreadsPost } from './types'

// Шаблоны постов дейтинг / отношения тематики (вирусные форматы Threads)
const TEMPLATES_RU = [
  'Никто не говорит об этом, но {topic} — это навык, а не везение. Вот что я понял за год свиданий 🧵',
  'Девушка спросила меня на первом свидании: «Что ты ищешь?» Я ответил честно — и это всё изменило.',
  'Если он пишет «доброе утро» каждый день, но никогда не зовёт на свидание — это не отношения, это хобби.',
  'Я перестал гнаться за людьми, которые не выбирают меня. Спокойствие стоит дороже любой переписки.',
  'Самая большая ошибка в знакомствах: пытаться понравиться всем. Будь собой — отсеется лишнее.',
  'Признаки, что человек реально в тебя влюблён (а не просто скучает): 🧵',
  'Перестала отвечать сразу. Угадайте, что произошло? Он стал писать в два раза больше.',
  'Любовь — это не бабочки в животе. Это когда с человеком спокойно. Поняла это в 30.',
  'Мужчина, который хочет — находит время, деньги и слова. Остальное — отмазки.',
  'Один вопрос на свидании, который сразу покажет, стоит ли продолжать общение 👇',
  'Я три года была в отношениях, которые путала с любовью. А это была привычка.',
  'Если тебе постоянно «сложно» с человеком — это не глубина чувств. Это несовместимость.',
  'Знакомства после 30 не страшнее. Просто ты наконец знаешь, чего НЕ хочешь.',
  'Он не «занятой». Он просто не приоритезирует тебя. Это разные вещи.',
  'Лучший комплимент на свидании — не про внешность. Вот что реально работает 🧵',
]

const TEMPLATES_EN = [
  'Nobody talks about this but {topic} is a skill, not luck. Here is what I learned 🧵',
  'A girl asked me on the first date: "What are you looking for?" My honest answer changed everything.',
  'If he texts "good morning" daily but never asks you out — that is not a relationship, that is a hobby.',
  'I stopped chasing people who do not choose me. Peace is worth more than any text thread.',
  'The biggest dating mistake: trying to be liked by everyone. Be yourself, filter the rest.',
  'Signs someone is actually into you (and not just bored): 🧵',
  'Green flags we should talk about more than red flags 👇',
  'Love is not butterflies. It is feeling calm with someone. Learned this at 30.',
  'Dating in 2026 is brutal but here are 5 things that actually work for me.',
  'One question on a date that instantly tells you if it is worth continuing.',
]

const TOPICS = [
  'отношения',
  'знакомства',
  'первое свидание',
  'построение доверия',
  'эмоциональная зрелость',
]

const USERNAMES = [
  { u: 'dating.diaries', n: 'Dating Diaries', f: 184000 },
  { u: 'love.notes_', n: 'Love Notes', f: 92000 },
  { u: 'relationship.coach', n: 'Mia · Coach', f: 451000 },
  { u: 'честно_о_любви', n: 'Честно о любви', f: 67000 },
  { u: 'свидания_и_точка', n: 'Свидания и точка', f: 121000 },
  { u: 'modern.romance', n: 'Modern Romance', f: 38000 },
  { u: 'heart.matters', n: 'Heart Matters', f: 256000 },
  { u: 'про.отношения', n: 'Про отношения', f: 89000 },
  { u: 'datinghacks', n: 'Dating Hacks', f: 512000 },
  { u: 'soft.life.love', n: 'Soft Life Love', f: 44000 },
  { u: 'тет_а_тет', n: 'Тет-а-тет', f: 73000 },
  { u: 'thelovelab', n: 'The Love Lab', f: 305000 },
]

// Детерминированный псевдослучайный генератор (seed) — стабильные демо-результаты
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function generateDemoPosts(
  keywords: string[],
  count: number,
  period: string
): ThreadsPost[] {
  const seedBase = hashStr(keywords.join(',') + period)
  const rnd = seeded(seedBase + 1)
  const posts: ThreadsPost[] = []

  const periodHours =
    period === '24h' ? 24 : period === '7d' ? 168 : period === '30d' ? 720 : 1440

  const allTemplates = [...TEMPLATES_RU, ...TEMPLATES_EN]
  const kw = keywords.length ? keywords : ['отношения']

  for (let i = 0; i < count; i++) {
    const author = USERNAMES[Math.floor(rnd() * USERNAMES.length)]
    const tpl = allTemplates[Math.floor(rnd() * allTemplates.length)]
    const topic = kw[Math.floor(rnd() * kw.length)]
    const text = tpl.replace('{topic}', topic)

    // Возраст в пределах периода
    const ageHours = rnd() * periodHours
    const timestamp = new Date(Date.now() - ageHours * 3600 * 1000).toISOString()

    // Метрики: делаем распределение с «залётными» выбросами
    const isViral = rnd() > 0.7
    const baseLikes = isViral
      ? 3000 + Math.floor(rnd() * 47000)
      : 50 + Math.floor(rnd() * 2500)
    const likes = baseLikes
    const replies = Math.floor(likes * (0.05 + rnd() * 0.25))
    const reposts = Math.floor(likes * (0.03 + rnd() * 0.15))
    const quotes = Math.floor(likes * (0.01 + rnd() * 0.06))
    const views = Math.floor(likes * (15 + rnd() * 60))

    const mediaRoll = rnd()
    const mediaType =
      mediaRoll > 0.85 ? 'VIDEO' : mediaRoll > 0.6 ? 'IMAGE' : 'TEXT'

    posts.push({
      id: `demo_${seedBase}_${i}`,
      text,
      username: author.u,
      displayName: author.n,
      avatarUrl: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
        author.u
      )}`,
      permalink: `https://www.threads.net/@${author.u}`,
      timestamp,
      mediaType,
      likes,
      replies,
      reposts,
      quotes,
      views,
      followers: author.f,
    })
  }

  return posts
}
