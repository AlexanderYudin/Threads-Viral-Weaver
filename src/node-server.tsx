import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './index'

// Раздаём статику из ./public (/static/* -> ./public/static/*)
app.use('/static/*', serveStatic({ root: './public' }))
app.get('/static/favicon.svg', serveStatic({ path: './public/static/favicon.svg' }))

const port = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Threads Viral Weaver listening on :${info.port}`)
})
