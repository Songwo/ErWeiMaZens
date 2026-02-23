import { Hono } from 'hono'
import type { Env, Session, UserProfile } from '../lib/types'
import { authMiddleware } from '../middleware/auth'

const profile = new Hono<{ Bindings: Env; Variables: { session: Session } }>()
profile.use('*', authMiddleware)

profile.get('/', async (c) => {
  const { userId } = c.get('session')
  const data = await c.env.AUTH_KV.get(`profile:${userId}`)
  return c.json(data ? JSON.parse(data) : {})
})

profile.put('/', async (c) => {
  const { userId } = c.get('session')
  const { customDomain } = await c.req.json<{ customDomain?: string }>()
  const p: UserProfile = { customDomain: customDomain?.trim() || undefined, updatedAt: new Date().toISOString() }
  await c.env.AUTH_KV.put(`profile:${userId}`, JSON.stringify(p))
  return c.json(p)
})

export default profile
