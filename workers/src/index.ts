import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './lib/types'
import auth from './routes/auth'
import qr from './routes/qr'
import shortlink from './routes/shortlink'
import keys from './routes/keys'
import profile from './routes/profile'
import teams from './routes/teams'
import webhooks from './routes/webhooks'
import qrEnhanced from './routes/qrEnhanced'
import ar from './routes/ar'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}))

// Authentication middleware
app.use('*', async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    c.set('user', null)
    return next()
  }

  const session = await c.env.AUTH_KV.get(`session:${token}`)
  if (session) {
    const sessionData = JSON.parse(session)
    c.set('user', sessionData)
  }

  return next()
})

app.route('/api/auth', auth)
app.route('/api/qr', qr)
app.route('/api/keys', keys)
app.route('/api/profile', profile)
app.route('/api/teams', teams)
app.route('/api/webhooks', webhooks)
app.route('/api/qr-enhanced', qrEnhanced)
app.route('/api/ar', ar)
app.route('/q', shortlink)

export default app
