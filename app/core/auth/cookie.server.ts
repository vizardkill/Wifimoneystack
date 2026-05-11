import { type User } from '@prisma/client'
import { createCookie, createCookieSessionStorage, redirect } from 'react-router'

import { verifyUserToken } from '@/core/auth/verify_token.server'

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) {
  throw new Error('SESSION_SECRET es requerido en el entorno para inicializar sesiones seguras.')
}

export const userSession = createCookie('user_session', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24
})

export const userSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'user_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24
  }
})

export function getSession(cookieHeader: string | null): Promise<Awaited<ReturnType<typeof userSessionStorage.getSession>>> {
  return userSessionStorage.getSession(cookieHeader)
}

export function commitSession(session: Awaited<ReturnType<typeof getSession>>): Promise<string> {
  return userSessionStorage.commitSession(session)
}

export function destroySession(session: Awaited<ReturnType<typeof getSession>>): Promise<string> {
  return userSessionStorage.destroySession(session)
}

export const getUserDataToken = async (cookieHeader: string | null): Promise<User> => {
  const session = await getSession(cookieHeader)
  const tokenValue: unknown = session.get('token')
  const token = typeof tokenValue === 'string' ? tokenValue : ''

  if (token.length === 0) {
    throw redirect('/login') as unknown as Error
  }

  try {
    const user = verifyUserToken(token)
    if (!user) {
      throw redirect('/login') as unknown as Error
    }
    return user
  } catch {
    throw redirect('/login') as unknown as Error
  }
}
