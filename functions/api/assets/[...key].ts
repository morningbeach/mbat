// functions/api/assets/[...key].ts

type Bindings = { ASSETS?: R2Bucket }

function joinKey(input: unknown): string | null {
  if (!input) return null
  if (Array.isArray(input)) {
    return input.join('/')
  }
  if (typeof input === 'string') return input
  return null
}

export const onRequestGet: PagesFunction<Bindings> = async (ctx) => {
  const bucket = ctx.env.ASSETS
  const rawKey = joinKey(ctx.params?.key)

  if (!bucket || !rawKey) {
    return new Response('Not Found', { status: 404 })
  }

  const object = await bucket.get(rawKey)
  if (!object) {
    return new Response('Not Found', { status: 404 })
  }

  const headers = new Headers({
    'cache-control': 'public, max-age=86400',
  })

  if (object.httpMetadata?.contentType) {
    headers.set('content-type', object.httpMetadata.contentType)
  }

  if (object.httpMetadata?.cacheControl) {
    headers.set('cache-control', object.httpMetadata.cacheControl)
  }

  return new Response(object.body, { headers })
}
