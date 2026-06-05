// ====== Threads Viral Weaver — frontend ======
const $ = (id) => document.getElementById(id);

const providerHints = {
  demo: 'Сгенерированные данные дейтинг-тематики. Работает без ключа. Метрики и ER реалистичны для теста интерфейса.',
  official:
    'graph.threads.net/keyword_search. Нужен access token (scope threads_keyword_search). НЕ отдаёт лайки/просмотры чужих постов → ER недоступен.',
  scrapecreators:
    'api.scrapecreators.com. Нужен x-api-key. Возвращает полные метрики (лайки, ответы, репосты, просмотры) → ER считается.',
  ensembledata:
    'ensembledata.com/apis/threads. Нужен token. Возвращает полные метрики → ER считается.',
};

// Восстановление настроек из localStorage
function loadSettings() {
  const provider = localStorage.getItem('tvw_provider') || 'demo';
  const token = localStorage.getItem('tvw_token') || '';
  $('provider').value = provider;
  $('token').value = token;
  updateHint();
}
function updateHint() {
  $('provider-hint').textContent = providerHints[$('provider').value] || '';
}

$('settingsBtn').addEventListener('click', () => {
  $('settings-panel').classList.toggle('hidden');
});
$('provider').addEventListener('change', () => {
  localStorage.setItem('tvw_provider', $('provider').value);
  updateHint();
});
$('token').addEventListener('input', () => {
  localStorage.setItem('tvw_token', $('token').value);
});

// Пресеты ключевых слов
document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    $('keywords').value = btn.dataset.preset;
  });
});

function parseKeywords(raw) {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function fmt(n) {
  if (n === null || n === undefined) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return Math.round(diff / 60) + ' мин назад';
  if (diff < 86400) return Math.round(diff / 3600) + ' ч назад';
  return Math.round(diff / 86400) + ' дн назад';
}

function viralBadge(score) {
  if (score === undefined || score === null) return '';
  let cls = 'bg-slate-100 text-slate-500';
  let label = '';
  if (score >= 70) {
    cls = 'bg-red-100 text-red-600';
    label = '🔥 мощно залетел';
  } else if (score >= 50) {
    cls = 'bg-orange-100 text-orange-600';
    label = '📈 залетает';
  } else if (score >= 30) {
    cls = 'bg-amber-100 text-amber-700';
    label = '👀 неплохо';
  } else {
    cls = 'bg-slate-100 text-slate-500';
    label = 'средне';
  }
  return `<span class="text-xs px-2 py-0.5 rounded-full font-semibold ${cls}">${label}</span>`;
}

let currentPosts = [];

function renderSummary(data) {
  const withMetrics = data.posts.filter((p) => p.engagement !== undefined);
  const avgEr =
    withMetrics.filter((p) => p.er !== null).reduce((s, p) => s + p.er, 0) /
    (withMetrics.filter((p) => p.er !== null).length || 1);
  const topViral = data.posts.reduce((m, p) => Math.max(m, p.viralScore || 0), 0);
  const totalEng = withMetrics.reduce((s, p) => s + (p.engagement || 0), 0);

  const cards = [
    { icon: 'fa-hashtag', label: 'Найдено постов', value: data.total, color: 'indigo' },
    { icon: 'fa-fire', label: 'Макс. viral score', value: topViral.toFixed(0), color: 'red' },
    { icon: 'fa-chart-line', label: 'Средний ER', value: data.metricsAvailable ? avgEr.toFixed(2) + '%' : '—', color: 'green' },
    { icon: 'fa-heart', label: 'Суммарно вовлечений', value: data.metricsAvailable ? fmt(totalEng) : '—', color: 'pink' },
  ];

  $('summary').innerHTML = cards
    .map(
      (c) => `
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="text-xs text-slate-400 mb-1"><i class="fas ${c.icon} mr-1 text-${c.color}-500"></i>${c.label}</div>
      <div class="text-2xl font-bold text-slate-800">${c.value}</div>
    </div>`
    )
    .join('');
  $('summary').classList.remove('hidden');
}

function renderNotes(notes) {
  if (!notes || notes.length === 0) {
    $('notes').classList.add('hidden');
    return;
  }
  $('notes').innerHTML = `
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
      <i class="fas fa-circle-info mr-1"></i>
      <ul class="inline-block align-top ml-1">
        ${notes.map((n) => `<li>• ${n}</li>`).join('')}
      </ul>
    </div>`;
  $('notes').classList.remove('hidden');
}

function postCard(p) {
  const metrics = p.engagement !== undefined;
  const mediaIcon =
    p.mediaType === 'VIDEO' ? 'fa-video' : p.mediaType === 'IMAGE' ? 'fa-image' : p.mediaType === 'CAROUSEL' ? 'fa-images' : 'fa-align-left';
  return `
  <article class="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition flex flex-col">
    <div class="flex items-center gap-3 mb-3">
      <img src="${p.avatarUrl || 'https://api.dicebear.com/7.x/thumbs/svg?seed=' + encodeURIComponent(p.username)}" class="w-10 h-10 rounded-full bg-slate-100" />
      <div class="min-w-0 flex-1">
        <div class="font-semibold text-sm truncate">${p.displayName || '@' + p.username}</div>
        <div class="text-xs text-slate-400">@${p.username} · ${timeAgo(p.timestamp)}</div>
      </div>
      <span class="text-slate-300"><i class="fas ${mediaIcon}"></i></span>
    </div>

    <p class="text-sm text-slate-700 mb-3 flex-1 line-clamp-5">${escapeHtml(p.text)}</p>

    <div class="flex items-center gap-3 mb-3 flex-wrap">
      ${viralBadge(p.viralScore)}
      ${p.viralScore !== undefined ? `<span class="text-xs text-slate-500"><i class="fas fa-fire-flame-curved text-red-400"></i> ${p.viralScore}</span>` : ''}
      ${metrics && p.er !== null ? `<span class="text-xs text-slate-500"><i class="fas fa-chart-line text-green-500"></i> ER ${p.er}%</span>` : ''}
    </div>

    <div class="grid grid-cols-4 gap-1 text-center text-xs text-slate-500 border-t border-slate-100 pt-3 mb-3">
      <div><div class="font-bold text-slate-700">${fmt(p.likes)}</div><i class="far fa-heart"></i></div>
      <div><div class="font-bold text-slate-700">${fmt(p.replies)}</div><i class="far fa-comment"></i></div>
      <div><div class="font-bold text-slate-700">${fmt(p.reposts)}</div><i class="fas fa-retweet"></i></div>
      <div><div class="font-bold text-slate-700">${fmt(p.views)}</div><i class="far fa-eye"></i></div>
    </div>

    <div class="flex gap-2">
      <button class="rewrite-btn flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold py-2 rounded-lg" data-id="${p.id}">
        <i class="fas fa-pen-nib mr-1"></i> Текст / рерайт
      </button>
      <a href="${p.permalink}" target="_blank" class="bg-slate-50 text-slate-500 hover:bg-slate-100 text-xs py-2 px-3 rounded-lg flex items-center">
        <i class="fas fa-external-link-alt"></i>
      </a>
    </div>
  </article>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderResults(data) {
  currentPosts = data.posts;
  if (data.posts.length === 0) {
    $('results').innerHTML = `<div class="text-center py-12 text-slate-400"><i class="fas fa-inbox text-4xl mb-2"></i><p>Ничего не найдено. Попробуйте другие ключи или период.</p></div>`;
    return;
  }
  $('results').innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">${data.posts
    .map(postCard)
    .join('')}</div>`;

  document.querySelectorAll('.rewrite-btn').forEach((b) => {
    b.addEventListener('click', () => openRewrite(b.dataset.id));
  });
}

// Модалка
function openRewrite(id) {
  const p = currentPosts.find((x) => x.id === id);
  if (!p) return;
  $('modal-text').textContent = p.text;
  $('openOriginal').href = p.permalink;
  $('rewrite-modal').classList.remove('hidden');
}
$('closeModal').addEventListener('click', () => $('rewrite-modal').classList.add('hidden'));
$('rewrite-modal').addEventListener('click', (e) => {
  if (e.target.id === 'rewrite-modal') $('rewrite-modal').classList.add('hidden');
});
$('copyText').addEventListener('click', () => {
  navigator.clipboard.writeText($('modal-text').textContent);
  $('copyText').innerHTML = '<i class="fas fa-check mr-1"></i> Скопировано';
  setTimeout(() => ($('copyText').innerHTML = '<i class="far fa-copy mr-1"></i> Скопировать'), 1500);
});

// Поиск
async function doSearch() {
  const keywords = parseKeywords($('keywords').value);
  if (keywords.length === 0) {
    alert('Введите хотя бы одно ключевое слово');
    return;
  }

  $('empty-state').classList.add('hidden');
  $('results').innerHTML = '';
  $('summary').classList.add('hidden');
  $('notes').classList.add('hidden');
  $('loader').classList.remove('hidden');

  const payload = {
    keywords,
    provider: $('provider').value,
    period: $('period').value,
    sortBy: $('sortBy').value,
    mediaType: $('mediaType').value,
    minViral: Number($('minViral').value) || 0,
    limit: Number($('limit').value),
    token: $('token').value || undefined,
  };

  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    $('loader').classList.add('hidden');
    if (data.error) {
      $('results').innerHTML = `<div class="text-center py-12 text-red-500"><i class="fas fa-triangle-exclamation text-3xl mb-2"></i><p>${data.error}</p></div>`;
      return;
    }
    renderSummary(data);
    renderNotes(data.notes);
    renderResults(data);
  } catch (e) {
    $('loader').classList.add('hidden');
    $('results').innerHTML = `<div class="text-center py-12 text-red-500"><i class="fas fa-plug-circle-xmark text-3xl mb-2"></i><p>Ошибка сети: ${e.message}</p></div>`;
  }
}

$('searchBtn').addEventListener('click', doSearch);
$('keywords').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) doSearch();
});

loadSettings();
