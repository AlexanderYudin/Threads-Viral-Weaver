const Swoosh = () => (
  <svg class="swoosh" viewBox="-1 -1 43 26" aria-hidden="true">
    <path
      fill="#00dc00"
      d="M0.3,4.5l10.4,18.7c1,1.9,3.8,1.9,4.9,0l9.3-16.7c2-3.6,5.8-5.8,9.9-5.8h3.9c1.9,0,3.2,2.1,2.3,3.9L30.5,23.2c-1,1.9-3.8,1.9-4.9,0L16.4,6.4c-2-3.6-5.8-5.8-9.9-5.8H2.6C0.6,0.6-0.6,2.8,0.3,4.5z"
    />
  </svg>
)

export const HomePage = () => {
  return (
    <div class="app">
      {/* Header */}
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="/">
            <span class="brand-mark">
              <Swoosh />
            </span>
            <span class="brand-text">
              <span class="brand-name">Twinby</span>
              <span class="brand-sub">Viral Weaver</span>
            </span>
          </a>
          <button id="settingsBtn" class="btn btn--ghost btn--sm">
            <i data-lucide="key-round"></i>
            <span>API-ключ</span>
          </button>
        </div>
      </header>

      <main class="container main">
        {/* Hero line */}
        <div class="hero">
          <p class="eyebrow">
            <span class="dot"></span> Threads · ER &amp; виральность
          </p>
          <h1 class="hero-title">
            Лови посты, от которых <span class="accent">бабочки</span> в ленте
          </h1>
          <p class="hero-cap">
            Ищем виральные публикации по ключевым словам, считаем ER и viral score, отбираем
            референсы для рерайта.
          </p>
        </div>

        {/* Панель поиска */}
        <section id="search-panel" class="panel glass">
          <div class="field field--full">
            <label class="label" for="keywords">
              <i data-lucide="tags"></i> Ключевые слова
              <span class="label-hint"> (через запятую или с новой строки)</span>
            </label>
            <textarea
              id="keywords"
              class="textarea"
              rows={2}
              placeholder="отношения, знакомства, первое свидание, как влюбить, dating, relationship advice"
            >
              отношения, знакомства, первое свидание, dating advice, relationship
            </textarea>
            <div class="chip-row" id="preset-tags">
              <span class="chip-row-label">Пресеты:</span>
              <button
                class="chip-tag preset-btn"
                data-preset="отношения, знакомства, первое свидание, расставание, как влюбить"
              >
                💕 Отношения (RU)
              </button>
              <button
                class="chip-tag preset-btn"
                data-preset="dating advice, relationship, first date, situationship, green flags, red flags"
              >
                💘 Dating (EN)
              </button>
              <button
                class="chip-tag preset-btn"
                data-preset="самооценка, психология отношений, тревожная привязанность, границы"
              >
                🧠 Психология (RU)
              </button>
            </div>
          </div>

          <div class="filters">
            <div class="field">
              <label class="label" for="period">
                <i data-lucide="clock"></i> Период
              </label>
              <div class="select-wrap">
                <select id="period" class="select">
                  <option value="24h">За 24 часа</option>
                  <option value="7d">За 7 дней</option>
                  <option value="30d">За 30 дней</option>
                  <option value="all">За всё время</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label class="label" for="sortBy">
                <i data-lucide="arrow-down-wide-narrow"></i> Сортировка
              </label>
              <div class="select-wrap">
                <select id="sortBy" class="select">
                  <option value="viral">🔥 По виральности</option>
                  <option value="er">📊 По ER (вовлечённость)</option>
                  <option value="likes">❤️ По лайкам</option>
                  <option value="recent">🕐 По свежести</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label class="label" for="mediaType">
                <i data-lucide="film"></i> Тип контента
              </label>
              <div class="select-wrap">
                <select id="mediaType" class="select">
                  <option value="ALL">Все</option>
                  <option value="TEXT">Только текст</option>
                  <option value="IMAGE">С картинкой</option>
                  <option value="VIDEO">С видео</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label class="label" for="minViral">
                <i data-lucide="flame"></i> Мин. viral
              </label>
              <input id="minViral" class="input" type="number" min="0" max="100" value="0" />
            </div>

            <div class="field">
              <label class="label" for="limit">
                <i data-lucide="list-ordered"></i> Лимит
              </label>
              <div class="select-wrap">
                <select id="limit" class="select">
                  <option value="20">20 постов</option>
                  <option value="30" selected>
                    30 постов
                  </option>
                  <option value="50">50 постов</option>
                  <option value="100">100 постов</option>
                </select>
              </div>
            </div>
          </div>

          <button id="searchBtn" class="btn btn--kiwi btn--lg btn--block">
            <i data-lucide="search"></i>
            <span>Найти виральные посты</span>
          </button>
        </section>

        {/* Настройки источника (скрыты по умолчанию) */}
        <section id="settings-panel" class="panel glass is-hidden">
          <h2 class="panel-title">
            <i data-lucide="key-round"></i> ScrapeCreators API-ключ
          </h2>
          <div class="field">
            <label class="label" for="token">
              x-api-key
            </label>
            <input
              id="token"
              class="input"
              type="password"
              placeholder="вставьте ключ ScrapeCreators (хранится только в браузере)"
            />
            <p class="field-note">
              Источник данных — ScrapeCreators (api.scrapecreators.com/v1/threads/search): полные
              метрики постов и расчёт виральности. Ключ не сохраняется на сервере, передаётся только
              для запроса к провайдеру.
            </p>
          </div>
        </section>

        {/* Сводка */}
        <div id="summary" class="summary is-hidden"></div>

        {/* Заметки/предупреждения */}
        <div id="notes" class="is-hidden"></div>

        {/* Результаты */}
        <section id="results"></section>

        {/* Пустое состояние */}
        <div id="empty-state" class="state">
          <Swoosh />
          <p class="state-title">Введите ключевые слова и нажмите «Найти виральные посты»</p>
          <p class="state-sub">
            Нужен ключ ScrapeCreators — вставьте его в «API-ключ» в шапке
          </p>
        </div>

        {/* Loader */}
        <div id="loader" class="state is-hidden">
          <i data-lucide="loader-circle" class="loader-icon"></i>
          <p class="state-sub">Ищем виральные посты...</p>
        </div>
      </main>

      <footer class="container site-footer">
        <Swoosh />
        <span>Twinby · Viral Weaver — поиск по ключевым словам, ER и виральность</span>
      </footer>

      {/* Модалка с текстом для рерайта */}
      <div id="rewrite-modal" class="modal-overlay is-hidden">
        <div class="modal glass">
          <div class="modal-head">
            <h3 class="modal-title">
              <i data-lucide="pen-tool"></i> Текст поста
            </h3>
            <button id="closeModal" class="modal-close" aria-label="Закрыть">
              <i data-lucide="x"></i>
            </button>
          </div>
          <pre id="modal-text" class="modal-text"></pre>
          <div class="modal-actions">
            <button id="copyText" class="btn btn--kiwi btn--md">
              <i data-lucide="copy"></i> Скопировать
            </button>
            <a id="openOriginal" target="_blank" class="btn btn--ghost btn--md">
              <i data-lucide="external-link"></i> Открыть оригинал
            </a>
          </div>
        </div>
      </div>

      <script src="/static/app.js"></script>
    </div>
  )
}
