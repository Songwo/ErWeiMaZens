import { Hono } from 'hono'
import type { Env, QRCode, LandingPage } from '../lib/types'
import { sha256 } from '../lib/auth'

const shortlink = new Hono<{ Bindings: Env }>()

function passwordForm(id: string, error = false) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>密码保护</title><style>
body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f1f5f9}
.box{background:#fff;padding:2rem;border-radius:1rem;box-shadow:0 4px 24px rgba(0,0,0,.1);text-align:center;width:100%;max-width:320px}
h2{margin:0 0 1rem;font-size:1.25rem}
input{width:100%;padding:.75rem;border:1px solid #e2e8f0;border-radius:.5rem;margin:.5rem 0;box-sizing:border-box;font-size:1rem}
button{width:100%;padding:.75rem;background:#3b82f6;color:#fff;border:none;border-radius:.5rem;cursor:pointer;font-size:1rem;font-weight:600}
.err{color:#ef4444;font-size:.875rem;margin:.25rem 0}
</style></head><body><div class="box">
<h2>🔒 密码保护</h2>
${error ? '<p class="err">密码错误，请重试</p>' : '<p style="color:#64748b;font-size:.875rem">此二维码受密码保护</p>'}
<form method="get"><input type="password" name="p" placeholder="请输入访问密码" autofocus>
<button type="submit">确认访问</button></form>
</div></body></html>`
}

function landingPageHtml(lp: LandingPage) {
  const dark = lp.theme === 'dark'
  const bg = dark ? '#0f172a' : '#f8fafc'
  const card = dark ? '#1e293b' : '#fff'
  const text = dark ? '#f1f5f9' : '#1e293b'
  const sub = dark ? '#94a3b8' : '#64748b'
  const secBtn = dark ? '#334155' : '#f1f5f9'
  const secText = dark ? '#f1f5f9' : '#1e293b'
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${lp.title}</title><style>
*{box-sizing:border-box}body{font-family:system-ui,sans-serif;margin:0;min-height:100vh;background:${bg};color:${text};display:flex;align-items:center;justify-content:center;padding:1rem}
.card{max-width:480px;width:100%;background:${card};border-radius:1.5rem;padding:2rem;box-shadow:0 4px 32px rgba(0,0,0,.12);text-align:center}
img{width:96px;height:96px;border-radius:50%;object-fit:cover;margin-bottom:1rem;border:3px solid #e2e8f0}
h1{font-size:1.5rem;margin:.25rem 0 .5rem}p{color:${sub};margin:0 0 1.5rem;line-height:1.6}
a{display:block;padding:.875rem 1.5rem;border-radius:.75rem;text-decoration:none;font-weight:600;margin:.5rem 0;transition:opacity .15s}
a:hover{opacity:.85}.primary{background:#3b82f6;color:#fff}.secondary{background:${secBtn};color:${secText}}
</style></head><body><div class="card">
${lp.imageUrl ? `<img src="${lp.imageUrl}" alt="">` : ''}
<h1>${lp.title}</h1>
${lp.description ? `<p>${lp.description}</p>` : ''}
${lp.buttons.map(b => `<a href="${b.url}" class="${b.primary ? 'primary' : 'secondary'}">${b.label}</a>`).join('')}
</div></body></html>`
}

shortlink.get('/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.env.QR_KV.get(`qr:${id}`)
  if (!data) return c.html('<h1>QR code not found</h1>', 404)

  const qrCode: QRCode = JSON.parse(data)

  if (qrCode.expireAt && new Date(qrCode.expireAt) < new Date())
    return c.html('<h1>This QR code has expired</h1>', 410)

  // Geofencing
  if (qrCode.geoRules?.length) {
    const country = c.req.header('CF-IPCountry') ?? ''
    const rule = qrCode.geoRules.find(r => r.countries.includes(country))
    if (rule) return c.redirect(rule.redirectUrl, 302)
  }

  // Password protection
  if (qrCode.passwordHash) {
    const p = c.req.query('p') ?? ''
    if (!p) return c.html(passwordForm(id), 200)
    const hash = await sha256(p)
    if (hash !== qrCode.passwordHash) return c.html(passwordForm(id, true), 200)
  }

  // Record scan
  const rawIp = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown'
  const parts = rawIp.split('.')
  const anonIp = parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : rawIp
  const logs = [...(qrCode.scanLogs ?? []), { time: new Date().toISOString(), ip: anonIp }].slice(-20)
  await c.env.QR_KV.put(`qr:${id}`, JSON.stringify({ ...qrCode, scanCount: qrCode.scanCount + 1, scanLogs: logs }))

  if (qrCode.landingPage) return c.html(landingPageHtml(qrCode.landingPage), 200)

  if (qrCode.qrType === 'vcard')
    return new Response(qrCode.content, {
      headers: { 'Content-Type': 'text/vcard; charset=utf-8', 'Content-Disposition': 'attachment; filename="contact.vcf"' },
    })
  if (qrCode.qrType !== 'url') return c.text(qrCode.content)

  const url = qrCode.content
  if (!/^https?:\/\//i.test(url)) return c.html('<h1>Invalid URL</h1>', 400)
  return c.redirect(url, 302)
})

export default shortlink
