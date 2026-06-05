import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Threads Viral Weaver — поиск залётных постов по ключам</title>
        <link rel="icon" href="/static/favicon.svg" type="image/svg+xml" />
        <meta
          name="description"
          content="Поиск виральных постов в Threads по ключевым словам, расчёт ER и виральности для дейтинг/отношения тематики"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
})
