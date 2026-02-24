// Cloudflare Pages Function for proxying images
export async function onRequestGet(context: any) {
  const url = new URL(context.request.url).searchParams.get('url')

  if (!url) {
    return new Response('Missing url parameter', { status: 400 })
  }

  try {
    const res = await fetch(url)
    const blob = await res.blob()

    return new Response(blob, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'image/png',
        'Cache-Control': 'public, max-age=3600'
      },
    })
  } catch (error) {
    return new Response('Failed to fetch image', { status: 500 })
  }
}
