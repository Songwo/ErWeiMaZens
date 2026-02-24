const DEFAULT_API_ORIGIN = 'https://erweimazens.zhaoqsnyah.workers.dev'

export async function onRequest(context: any) {
  const reqUrl = new URL(context.request.url)
  if (reqUrl.pathname === '/api/proxy-image' && typeof context.next === 'function') {
    return context.next()
  }
  const path = reqUrl.pathname.replace(/^\/api/, '') || '/'
  const origin = (context.env.API_ORIGIN ?? DEFAULT_API_ORIGIN).replace(/\/$/, '')
  const upstream = new URL(`${origin}/api${path}`)
  upstream.search = reqUrl.search

  const headers = new Headers(context.request.headers)
  headers.delete('host')

  const init: RequestInit = {
    method: context.request.method,
    headers,
    body: ['GET', 'HEAD'].includes(context.request.method) ? undefined : context.request.body,
    redirect: 'manual',
  }

  return fetch(upstream.toString(), init)
}
