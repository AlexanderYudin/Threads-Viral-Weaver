import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#15101F" />
        <title>Twinby · Viral Weaver — поиск виральных постов в Threads</title>
        <link rel="icon" href="/static/favicon.svg" type="image/svg+xml" />
        <meta
          name="description"
          content="Twinby Viral Weaver — поиск виральных постов в Threads по ключевым словам, расчёт ER и виральности для дейтинг/отношения тематики"
        />
        <script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
})
