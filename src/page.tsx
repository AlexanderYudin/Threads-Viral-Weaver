export const HomePage = () => {
  return (
    <div class="min-h-screen">
      {/* Header */}
      <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i class="fas fa-fire text-2xl text-amber-300"></i>
            <div>
              <h1 class="text-xl font-bold leading-tight">Threads Viral Weaver</h1>
              <p class="text-xs text-indigo-100">
                Поиск залётных постов по ключевым словам · ER &amp; виральность
              </p>
            </div>
          </div>
          <button
            id="settingsBtn"
            class="text-sm bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg transition"
          >
            <i class="fas fa-key mr-1"></i> Источник данных
          </button>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6">
        {/* Панель поиска */}
        <section id="search-panel" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Ключевые слова */}
            <div class="lg:col-span-3">
              <label class="block text-sm font-semibold mb-1">
                <i class="fas fa-tags text-indigo-500 mr-1"></i> Ключевые слова
                <span class="font-normal text-slate-400">
                  {' '}
                  (через запятую или с новой строки)
                </span>
              </label>
              <textarea
                id="keywords"
                rows={2}
                class="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                placeholder="отношения, знакомства, первое свидание, как влюбить, dating, relationship advice"
              >
                отношения, знакомства, первое свидание, dating advice, relationship
              </textarea>
              <div class="mt-2 flex flex-wrap gap-2" id="preset-tags">
                <span class="text-xs text-slate-400 mr-1 self-center">Пресеты:</span>
                <button class="preset-btn text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full hover:bg-indigo-100" data-preset="отношения, знакомства, первое свидание, расставание, как влюбить">
                  💕 Отношения (RU)
                </button>
                <button class="preset-btn text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full hover:bg-indigo-100" data-preset="dating advice, relationship, first date, situationship, green flags, red flags">
                  💘 Dating (EN)
                </button>
                <button class="preset-btn text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full hover:bg-indigo-100" data-preset="самооценка, психология отношений, тревожная привязанность, границы">
                  🧠 Психология (RU)
                </button>
              </div>
            </div>

            {/* Фильтры */}
            <div>
              <label class="block text-sm font-semibold mb-1">
                <i class="far fa-clock text-indigo-500 mr-1"></i> Период
              </label>
              <select id="period" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="24h">За 24 часа</option>
                <option value="7d">За 7 дней</option>
                <option value="30d">За 30 дней</option>
                <option value="all">За всё время</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1">
                <i class="fas fa-sort-amount-down text-indigo-500 mr-1"></i> Сортировка
              </label>
              <select id="sortBy" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="viral">🔥 По виральности</option>
                <option value="er">📊 По ER (вовлечённость)</option>
                <option value="likes">❤️ По лайкам</option>
                <option value="recent">🕐 По свежести</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1">
                <i class="fas fa-photo-film text-indigo-500 mr-1"></i> Тип контента
              </label>
              <select id="mediaType" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="ALL">Все</option>
                <option value="TEXT">Только текст</option>
                <option value="IMAGE">С картинкой</option>
                <option value="VIDEO">С видео</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1">
                <i class="fas fa-fire-flame-curved text-indigo-500 mr-1"></i> Мин. viral score
              </label>
              <input id="minViral" type="number" min="0" max="100" value="0" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1">
                <i class="fas fa-list-ol text-indigo-500 mr-1"></i> Лимит
              </label>
              <select id="limit" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="20">20 постов</option>
                <option value="30" selected>30 постов</option>
                <option value="50">50 постов</option>
                <option value="100">100 постов</option>
              </select>
            </div>

            <div class="lg:col-span-3">
              <button id="searchBtn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                <i class="fas fa-magnifying-glass"></i>
                <span>Найти залётные посты</span>
              </button>
            </div>
          </div>
        </section>

        {/* Настройки источника (скрыты по умолчанию) */}
        <section id="settings-panel" class="hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <h2 class="font-semibold mb-3"><i class="fas fa-database text-indigo-500 mr-1"></i> Источник данных</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">Провайдер</label>
              <select id="provider" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="demo">🧪 Демо (без ключа, с метриками)</option>
                <option value="official">🔵 Официальный Threads API (без метрик)</option>
                <option value="scrapecreators">🟢 ScrapeCreators (с метриками)</option>
                <option value="ensembledata">🟣 EnsembleData (с метриками)</option>
              </select>
              <p class="text-xs text-slate-400 mt-1" id="provider-hint"></p>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Token / API-ключ</label>
              <input id="token" type="password" placeholder="вставьте ключ (хранится только в браузере)" class="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400" />
              <p class="text-xs text-slate-400 mt-1">Ключ не сохраняется на сервере. Передаётся только для запроса к выбранному провайдеру.</p>
            </div>
          </div>
        </section>

        {/* Сводка */}
        <div id="summary" class="hidden mb-4 grid grid-cols-2 md:grid-cols-4 gap-3"></div>

        {/* Заметки/предупреждения */}
        <div id="notes" class="hidden mb-4"></div>

        {/* Результаты */}
        <section id="results"></section>

        {/* Пустое состояние */}
        <div id="empty-state" class="text-center py-16 text-slate-400">
          <i class="fas fa-fire text-5xl mb-3 text-slate-200"></i>
          <p>Введите ключевые слова и нажмите «Найти залётные посты»</p>
          <p class="text-xs mt-1">Демо-режим работает без ключей — попробуйте прямо сейчас</p>
        </div>

        {/* Loader */}
        <div id="loader" class="hidden text-center py-16">
          <i class="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
          <p class="mt-3 text-slate-500">Ищем залётные посты...</p>
        </div>
      </main>

      <footer class="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-slate-400">
        Threads Viral Weaver · поиск по ключевым словам · расчёт ER и виральности
      </footer>

      {/* Модалка с текстом для рерайта */}
      <div id="rewrite-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-auto">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-lg"><i class="fas fa-pen-nib text-indigo-500 mr-1"></i> Текст поста</h3>
            <button id="closeModal" class="text-slate-400 hover:text-slate-700"><i class="fas fa-times text-xl"></i></button>
          </div>
          <pre id="modal-text" class="whitespace-pre-wrap text-sm bg-slate-50 rounded-xl p-4 border border-slate-200"></pre>
          <div class="mt-4 flex gap-2">
            <button id="copyText" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"><i class="far fa-copy mr-1"></i> Скопировать</button>
            <a id="openOriginal" target="_blank" class="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm"><i class="fas fa-external-link-alt mr-1"></i> Открыть оригинал</a>
          </div>
        </div>
      </div>

      <script src="/static/app.js"></script>
    </div>
  )
}
