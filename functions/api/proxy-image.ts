export async function onRequestGet(context: any) {
  const raw = new URL(context.request.url).searchParams.get('url')
  if (!raw) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const candidates = [raw]
  try {
    candidates.push(decodeURIComponent(raw))
  } catch {}

  let target: URL | null = null
  for (const c of candidates) {
    try {
      const parsed = new URL(c)
      if (['http:', 'https:'].includes(parsed.protocol)) {
        target = parsed
        break
      }
    } catch {}
  }

  if (!target) {
    return new Response(JSON.stringify({ error: 'Invalid url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: 'image/*,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; ErWeiMaZensImageProxy/1.0)',
    },
  })

  if (!upstream.ok) {
    return new Response(
      JSON.stringify({
        error: 'Upstream image request failed',
        upstreamStatus: upstream.status,
        upstreamUrl: target.toString(),
      }),
      {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
