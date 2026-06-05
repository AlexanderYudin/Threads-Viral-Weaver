import { createHmac, timingSafeEqual } from 'node:crypto'

// Единый вход Twinby/Neuralab (как в остальных сервисах): Google Sign-In,
// допускаются только корпоративные домены.
export const GOOGLE_CLIENT_ID =
  '164827583552-4uc655jb3c190r3g59cm751kq778hrpa.apps.googleusercontent.com'
export const ALLOWED_DOMAINS = ['twinby.com', 'neuralab.tech']

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 дней
const COOKIE_NAME = 'tvw_session'

function secret(): string {
  return (
    (typeof process !== 'undefined' && process.env?.AUTH_SECRET) ||
    'dev-insecure-secret-change-me'
  )
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url')
}

export interface SessionUser {
  email: string
  name?: string
  picture?: string
  exp: number
}

// ---- подпись/проверка сессионной cookie (HMAC-SHA256) ----
export function signSession(user: Omit<SessionUser, 'exp'>): string {
  const payload: SessionUser = { ...user, exp: Date.now() + SESSION_TTL_MS }
  const data = b64url(JSON.stringify(payload))
  const sig = b64url(createHmac('sha256', secret()).update(data).digest())
  return `${data}.${sig}`
}

export function verifySession(token?: string): SessionUser | null {
  if (!token || !token.includes('.')) return null
  const [data, sig] = token.split('.')
  const expected = b64url(createHmac('sha256', secret()).update(data).digest())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const user: SessionUser = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (!user.exp || user.exp < Date.now()) return null
    return user
  } catch {
    return null
  }
}

export function cookieHeader(token: string, maxAgeSec = SESSION_TTL_MS / 1000): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}`
}
export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}
export function readCookie(cookieHeaderValue?: string): string | undefined {
  if (!cookieHeaderValue) return undefined
  for (const part of cookieHeaderValue.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === COOKIE_NAME) return v.join('=')
  }
  return undefined
}

// ---- валидация Google ID-токена через tokeninfo (без доп. библиотек) ----
export async function verifyGoogleCredential(
  credential: string
): Promise<{ email: string; name?: string; picture?: string } | { error: string }> {
  try {
    const res = await fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential)
    )
    if (!res.ok) return { error: 'Не удалось проверить токен Google' }
    const p: any = await res.json()
    const iss = String(p.iss || '')
    if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com')
      return { error: 'Неверный issuer токена' }
    if (p.aud !== GOOGLE_CLIENT_ID) return { error: 'Неверный client_id' }
    if (p.email_verified !== true && p.email_verified !== 'true')
      return { error: 'Email не подтверждён' }
    const email: string = String(p.email || '').toLowerCase()
    const domain = email.split('@')[1]
    if (!ALLOWED_DOMAINS.includes(domain))
      return {
        error: 'Доступ только для почты @twinby.com или @neuralab.tech',
      }
    return { email, name: p.name, picture: p.picture }
  } catch (e: any) {
    return { error: 'Ошибка проверки Google: ' + e.message }
  }
}
