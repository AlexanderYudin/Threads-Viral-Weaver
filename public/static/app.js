// ====== Twinby · Viral Weaver — frontend (ScrapeCreators only) ======
const $ = (id) => document.getElementById(id);
const PROVIDER = 'scrapecreators';

// Перерисовать Lucide-иконки в новой разметке
function icons() {
  if (window.lucide) lucide.createIcons();
}

let hasDefaultKey = false;

// ===== Авторизация (Google Sign-In, домены Twinby/Neuralab) =====
function showGate() {
  $('login-gate').classList.remove('is-hidden');
  $('user-chip').classList.add('is-hidden');
}
function showApp(user) {
  $('login-gate').classList.add('is-hidden');
  if (user && user.email) {
    $('user-email').textContent = user.email;
    if (user.picture) {
      $('user-avatar').src = user.picture;
      $('user-avatar').style.display = '';
    } else {
      $('user-avatar').style.display = 'none';
    }
    $('user-chip').classList.remove('is-hidden');
  }
  loadConfig();
  icons();
}
function loginError(msg) {
  const el = $('login-error');
  el.textContent = msg || 'Доступ запрещён';
  el.classList.remove('is-hidden');
}

window.handleGoogleLogin = async (response) => {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json();
    if (data.allowed) showApp(data);
    else loginError(data.error);
  } catch (e) {
    loginError('Ошибка сети при входе: ' + e.message);
  }
};

async function initAuth() {
  try {
    const me = await fetch('/api/me').then((r) => r.json());
    if (me.authed) showApp(me);
    else showGate();
  } catch {
    showGate();
  }
}

$('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
});

// Восстановление ключа из localStorage + статус дефолтного ключа на сервере
function loadSettings() {
  $('token').value = localStorage.getItem('tvw_token') || '';
}

async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    hasDefaultKey = !!cfg.hasDefaultKey;
  } catch {
    hasDefaultKey = false;
  }
  if (hasDefaultKey) {
    $('token-note').innerHTML =
      'На сервере задан ключ по умолчанию — можно искать без ввода. Свой ключ здесь переопределит дефолтный (хранится только в браузере). Источник — ScrapeCreators.';
  }
}

$('settingsBtn').addEventListener('click', () => {
  $('settings-panel').classList.toggle('is-hidden');
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
  if (score >= 70) return `<span class="badge badge--fire"><i data-lucide="flame"></i> топ-виральный</span>`;
  if (score >= 50) return `<span class="badge badge--hot"><i data-lucide="trending-up"></i> виральный</span>`;
  if (score >= 30) return `<span class="badge badge--ok"><i data-lucide="eye"></i> набирает</span>`;
  return `<span class="badge badge--mid"><i data-lucide="minus"></i> средне</span>`;
}

let currentPosts = [];

function renderSummary(data) {
  const withMetrics = data.posts.filter((p) => p.engagement !== undefined);
  const erPosts = withMetrics.filter((p) => p.er !== null && p.er !== undefined);
  const avgEr = erPosts.reduce((s, p) => s + p.er, 0) / (erPosts.length || 1);
  const topViral = data.posts.reduce((m, p) => Math.max(m, p.viralScore || 0), 0);
  const totalEng = withMetrics.reduce((s, p) => s + (p.engagement || 0), 0);

  const cards = [
    { icon: 'hash', label: 'Найдено постов', value: data.total, mod: 'kiwi' },
    { icon: 'flame', label: 'Макс. viral score', value: topViral.toFixed(0), mod: 'amber' },
    {
      icon: 'trending-up',
      label: 'Средний ER',
      value: data.metricsAvailable && erPosts.length ? avgEr.toFixed(2) + '%' : '—',
      mod: 'purple',
    },
    {
      icon: 'heart',
      label: 'Суммарно вовлечений',
      value: data.metricsAvailable ? fmt(totalEng) : '—',
      mod: 'pink',
    },
  ];

  $('summary').innerHTML = cards
    .map(
      (c) => `
    <div class="stat stat--${c.mod}">
      <div class="stat-label"><i data-lucide="${c.icon}"></i>${c.label}</div>
      <div class="stat-value">${c.value}</div>
    </div>`
    )
    .join('');
  $('summary').classList.remove('is-hidden');
}

function renderNotes(notes) {
  if (!notes || notes.length === 0) {
    $('notes').classList.add('is-hidden');
    return;
  }
  $('notes').innerHTML = `
    <div class="notes-box">
      <i data-lucide="info"></i>
      <ul>${notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
    </div>`;
  $('notes').classList.remove('is-hidden');
}

function postCard(p) {
  const metrics = p.engagement !== undefined;
  const mediaIcon =
    p.mediaType === 'VIDEO'
      ? 'video'
      : p.mediaType === 'IMAGE'
      ? 'image'
      : p.mediaType === 'CAROUSEL'
      ? 'images'
      : 'align-left';
  // Instagram CDN блокирует хотлинк (CORP same-origin) → fallback на сгенерированный аватар
  const fallback =
    'https://api.dicebear.com/7.x/thumbs/svg?backgroundColor=8746ff,00dc00&seed=' +
    encodeURIComponent(p.username);
  const avatar = p.avatarUrl || fallback;
  return `
  <article class="post">
    <div class="post-head">
      <img class="post-avatar" src="${avatar}" alt="" loading="lazy" referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.src='${fallback}'" />
      <div class="post-id">
        <div class="post-name">${escapeHtml(p.displayName || '@' + p.username)}</div>
        <div class="post-meta">@${escapeHtml(p.username)} · ${timeAgo(p.timestamp)}</div>
      </div>
      <span class="post-media-ico"><i data-lucide="${mediaIcon}"></i></span>
    </div>

    <p class="post-text">${escapeHtml(p.text)}</p>

    <div class="post-tags">
      ${viralBadge(p.viralScore)}
      ${
        p.viralScore !== undefined && p.viralScore !== null
          ? `<span class="metric-inline"><i data-lucide="flame"></i> ${p.viralScore}</span>`
          : ''
      }
      ${
        metrics && p.er !== null && p.er !== undefined
          ? `<span class="metric-inline er"><i data-lucide="trending-up"></i> ER ${p.er}%</span>`
          : ''
      }
    </div>

    <div class="post-stats">
      <div><div class="s-val">${fmt(p.likes)}</div><div class="s-ico"><i data-lucide="heart"></i></div></div>
      <div><div class="s-val">${fmt(p.replies)}</div><div class="s-ico"><i data-lucide="message-circle"></i></div></div>
      <div><div class="s-val">${fmt(p.reposts)}</div><div class="s-ico"><i data-lucide="repeat-2"></i></div></div>
      <div><div class="s-val">${fmt(p.views)}</div><div class="s-ico"><i data-lucide="eye"></i></div></div>
    </div>

    <div class="post-actions">
      <button class="btn btn--secondary btn--sm rewrite-btn" data-id="${escapeHtml(p.id)}">
        <i data-lucide="pen-tool"></i> Текст / рерайт
      </button>
      <a class="btn btn--ghost btn--sm btn--icon" href="${escapeHtml(p.permalink)}" target="_blank" rel="noopener" aria-label="Открыть оригинал">
        <i data-lucide="external-link"></i>
      </a>
    </div>
  </article>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderResults(data) {
  currentPosts = data.posts;
  if (data.posts.length === 0) {
    $('results').innerHTML = `<div class="state"><i data-lucide="inbox" style="width:32px;height:32px;margin:0 auto 8px"></i><p class="state-title">Ничего не найдено</p><p class="state-sub">Попробуйте другие ключи или период.</p></div>`;
    icons();
    return;
  }
  $('results').innerHTML = `<div class="results-grid">${data.posts.map(postCard).join('')}</div>`;
  icons();

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
  $('rewrite-modal').classList.remove('is-hidden');
}
$('closeModal').addEventListener('click', () => $('rewrite-modal').classList.add('is-hidden'));
$('rewrite-modal').addEventListener('click', (e) => {
  if (e.target.id === 'rewrite-modal') $('rewrite-modal').classList.add('is-hidden');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $('rewrite-modal').classList.add('is-hidden');
});
$('copyText').addEventListener('click', () => {
  navigator.clipboard.writeText($('modal-text').textContent);
  $('copyText').innerHTML = '<i data-lucide="check"></i> Скопировано';
  icons();
  setTimeout(() => {
    $('copyText').innerHTML = '<i data-lucide="copy"></i> Скопировать';
    icons();
  }, 1500);
});

// Поиск
async function doSearch() {
  const keywords = parseKeywords($('keywords').value);
  if (keywords.length === 0) {
    alert('Введите хотя бы одно ключевое слово');
    return;
  }
  if (!$('token').value && !hasDefaultKey) {
    $('settings-panel').classList.remove('is-hidden');
    $('token').focus();
    alert('Вставьте ключ ScrapeCreators (x-api-key) в «API-ключ»');
    return;
  }

  $('empty-state').classList.add('is-hidden');
  $('results').innerHTML = '';
  $('summary').classList.add('is-hidden');
  $('notes').classList.add('is-hidden');
  $('loader').classList.remove('is-hidden');
  $('searchBtn').classList.add('is-loading');

  const payload = {
    keywords,
    provider: PROVIDER,
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
    $('loader').classList.add('is-hidden');
    $('searchBtn').classList.remove('is-loading');
    if (data.error) {
      $('results').innerHTML = `<div class="state state--error"><i data-lucide="triangle-alert"></i><p class="state-title">${escapeHtml(data.error)}</p></div>`;
      icons();
      return;
    }
    renderSummary(data);
    renderNotes(data.notes);
    renderResults(data);
    icons();
  } catch (e) {
    $('loader').classList.add('is-hidden');
    $('searchBtn').classList.remove('is-loading');
    $('results').innerHTML = `<div class="state state--error"><i data-lucide="unplug"></i><p class="state-title">Ошибка сети: ${escapeHtml(e.message)}</p></div>`;
    icons();
  }
}

$('searchBtn').addEventListener('click', doSearch);
$('keywords').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) doSearch();
});

loadSettings();
initAuth();
icons();
