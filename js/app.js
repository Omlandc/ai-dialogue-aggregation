(function() {
  'use strict';

  const PRESETS = {
    // AI 对话
    doubao:     { name: '豆包',        url: 'https://www.doubao.com/chat/', icon: '🟢' },
    kimi:       { name: 'Kimi',        url: 'https://kimi.moonshot.cn/', icon: '🌙' },
    baidu:      { name: '文心一言',     url: 'https://yiyan.baidu.com/', icon: '🐻' },
    chatglm:    { name: '智谱清言',     url: 'https://chatglm.cn/', icon: '💬' },
    hunyuan:    { name: '腾讯元宝',     url: 'https://yuanbao.tencent.com/chat', icon: '💰' },
    tiangong:   { name: '天工AI',      url: 'https://www.tiangong.cn/', icon: '⚡' },
    // 搜索资讯
    google:     { name: 'Google',      url: 'https://www.google.com/', icon: '🔍' },
    bing:       { name: 'Bing',        url: 'https://www.bing.com/', icon: '🔎' },
    baidu_s:    { name: '百度搜索',     url: 'https://m.baidu.com/', icon: '🅱️' },
    zhihu:      { name: '知乎',        url: 'https://www.zhihu.com/', icon: '❓' },
    // 视频社交
    bilibili:   { name: 'Bilibili',    url: 'https://m.bilibili.com/', icon: '📺' },
    youtube:    { name: 'YouTube',     url: 'https://m.youtube.com/', icon: '▶️' },
    twitter:    { name: 'X',           url: 'https://x.com/', icon: '𝕏' },
    weibo:      { name: '微博',        url: 'https://m.weibo.cn/', icon: '📢' },
    // 购物生活
    taobao:     { name: '淘宝',        url: 'https://m.taobao.com/', icon: '🛒' },
    jd:         { name: '京东',        url: 'https://m.jd.com/', icon: '📦' },
    // 工具效率
    github:     { name: 'GitHub',      url: 'https://github.com/', icon: '🐙' },
    amap:       { name: '高德地图',     url: 'https://m.amap.com/', icon: '🗺️' },
    fanyi:      { name: '百度翻译',     url: 'https://fanyi.baidu.com/', icon: '🌐' },
  };

  const PRESET_GROUPS = [
    { id: 'ai',      title: { zh: '🤖 AI 对话', en: '🤖 AI Chat', ja: '🤖 AIチャット' }, keys: ['doubao','kimi','baidu','chatglm','hunyuan','tiangong'] },
    { id: 'search',  title: { zh: '🔍 搜索资讯', en: '🔍 Search', ja: '🔍 検索・情報' }, keys: ['google','bing','baidu_s','zhihu'] },
    { id: 'social',  title: { zh: '📺 视频社交', en: '📺 Social & Video', ja: '📺 動画・SNS' }, keys: ['bilibili','youtube','twitter','weibo'] },
    { id: 'shopping',title: { zh: '🛒 购物生活', en: '🛒 Shopping', ja: '🛒 ショッピング' }, keys: ['taobao','jd'] },
    { id: 'tools',   title: { zh: '🛠️ 工具效率', en: '🛠️ Tools', ja: '🛠️ ツール' }, keys: ['github','amap','fanyi'] },
  ];

  const STORAGE_KEY = 'ai_agg_config_v3';

  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  function generateUid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function migrateSlots(data) {
    if (!Array.isArray(data) || !data.length) return null;
    if (data[0] && typeof data[0] === 'object' && data[0].uid) return data;
    if (typeof data[0] === 'string') {
      return data.map(key => ({ uid: generateUid(), key }));
    }
    return null;
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const migrated = migrateSlots(parsed);
        if (migrated) return migrated;
      }
    } catch (e) {}
    return [
      { uid: generateUid(), key: 'doubao' },
      { uid: generateUid(), key: 'kimi' },
      { uid: generateUid(), key: 'hunyuan' },
      { uid: generateUid(), key: 'baidu' },
      { uid: generateUid(), key: 'chatglm' },
      { uid: generateUid(), key: 'tiangong' },
    ];
  }

  function saveConfig(slots) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(slots)); } catch (e) {}
  }

  let slots = loadConfig();
  let editUid = null;
  let dragSrcUid = null;

  function getSlotInfo(keyOrUrl) {
    if (PRESETS[keyOrUrl]) return { ...PRESETS[keyOrUrl], key: keyOrUrl };
    try {
      const u = new URL(keyOrUrl);
      return { name: u.hostname.replace(/^www\./, ''), url: keyOrUrl, icon: '🔗', key: keyOrUrl };
    } catch (e) {
      return { name: String(keyOrUrl), url: String(keyOrUrl), icon: '🌐', key: String(keyOrUrl) };
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
  }

  function t(key) {
    const map = TRANSLATIONS[document.documentElement.lang] || TRANSLATIONS['zh'];
    return map[key] || key;
  }

  function groupTitle(group) {
    const lang = (document.documentElement.lang || 'zh').slice(0, 2);
    return group.title[lang] || group.title['zh'];
  }

  const TRANSLATIONS = {
    zh: {
      reload: '重新加载',
      openNew: '新窗口打开',
      change: '切换网站',
      remove: '移除',
      addWindow: '添加窗口',
      iframeHint: '部分网站可能因安全策略无法在框架内加载，请使用新窗口打开。',
      modalTitleAdd: '添加窗口',
      modalTitleEdit: '切换网站',
      customUrl: '自定义网址',
      save: '保存',
      cancel: '取消',
      closeAll: '全部关闭',
    },
    en: {
      reload: 'Reload',
      openNew: 'Open in new tab',
      change: 'Change site',
      remove: 'Remove',
      addWindow: 'Add window',
      iframeHint: 'Some sites may not load in frames due to security policy. Open in a new tab instead.',
      modalTitleAdd: 'Add Window',
      modalTitleEdit: 'Change Site',
      customUrl: 'Custom URL',
      save: 'Save',
      cancel: 'Cancel',
      closeAll: 'Close All',
    },
  };

  function createCard(slot, info) {
    const card = document.createElement('div');
    card.className = 'ai-card';
    card.dataset.uid = slot.uid;
    card.draggable = true;
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title" title="${escapeHtml(info.name)}">
          <span aria-hidden="true">${info.icon}</span>
          <span>${escapeHtml(info.name)}</span>
        </div>
        <div class="card-actions">
          <button class="icon-btn" data-action="reload" data-uid="${slot.uid}" title="${t('reload')}">↻</button>
          <button class="icon-btn" data-action="open" data-uid="${slot.uid}" title="${t('openNew')}">↗</button>
          <button class="icon-btn" data-action="change" data-uid="${slot.uid}" title="${t('change')}">⚙</button>
          <button class="icon-btn" data-action="remove" data-uid="${slot.uid}" title="${t('remove')}">✕</button>
        </div>
      </div>
      <div class="card-body">
        <iframe src="${escapeHtml(info.url)}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" loading="lazy" title="${escapeHtml(info.name)}"></iframe>
        <div class="card-overlay" id="overlay-${slot.uid}">
          <div class="ai-logo">${info.icon}</div>
          <div class="ai-name">${escapeHtml(info.name)}</div>
          <div class="ai-desc">${t('iframeHint')}</div>
          <a class="open-btn" href="${escapeHtml(info.url)}" target="_blank" rel="noopener">${t('openNew')}</a>
        </div>
      </div>
    `;
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.innerHTML = '◢';
    card.appendChild(resizeHandle);

    let isResizing = false;
    let startX, startY, startW, startH;
    resizeHandle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      const style = window.getComputedStyle(card);
      startW = parseInt(style.width, 10);
      startH = parseInt(style.height, 10);
    });
    const onMouseMove = (e) => {
      if (!isResizing) return;
      card.style.width = Math.max(280, startW + e.clientX - startX) + 'px';
      card.style.height = Math.max(240, startH + e.clientY - startY) + 'px';
    };
    const onMouseUp = () => { isResizing = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    bindDrag(card);
    return card;
  }

  function createAddCard() {
    const card = document.createElement('div');
    card.className = 'ai-card add-card';
    card.dataset.action = 'add';
    card.innerHTML = `
      <button class="add-btn" aria-label="${t('addWindow')}">+</button>
      <div class="add-label">${t('addWindow')}</div>
    `;
    return card;
  }

  function bindDrag(card) {
    card.addEventListener('dragstart', (e) => {
      dragSrcUid = card.dataset.uid;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragSrcUid);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      dragSrcUid = null;
      card.classList.remove('dragging');
      $$('.ai-card').forEach(c => c.classList.remove('drag-over'));
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    });
    card.addEventListener('dragenter', (e) => {
      if (card.dataset.uid !== dragSrcUid && !card.classList.contains('add-card')) {
        card.classList.add('drag-over');
      }
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });
    card.addEventListener('drop', (e) => {
      e.stopPropagation();
      e.preventDefault();
      card.classList.remove('drag-over');
      const srcUid = e.dataTransfer.getData('text/plain');
      if (srcUid && srcUid !== card.dataset.uid && !card.classList.contains('add-card')) {
        reorderSlots(srcUid, card.dataset.uid);
      }
      return false;
    });
  }

  function renderSlots() {
    const container = $('.grid-2x2');
    container.innerHTML = '';
    slots.forEach(slot => {
      const info = getSlotInfo(slot.key);
      container.appendChild(createCard(slot, info));
    });
    container.appendChild(createAddCard());
  }

  function insertSlot(keyOrUrl) {
    const slot = { uid: generateUid(), key: keyOrUrl };
    slots.push(slot);
    saveConfig(slots);

    const container = $('.grid-2x2');
    const addCard = container.querySelector('.add-card');
    const info = getSlotInfo(keyOrUrl);
    const card = createCard(slot, info);
    if (addCard) {
      container.insertBefore(card, addCard);
    } else {
      container.appendChild(card);
    }
  }

  function removeSlot(uid) {
    const idx = slots.findIndex(s => s.uid === uid);
    if (idx === -1) return;
    slots.splice(idx, 1);
    saveConfig(slots);
    const card = $(`.ai-card[data-uid="${uid}"]`);
    if (card) card.remove();
  }

  function updateSlot(uid, keyOrUrl) {
    const slot = slots.find(s => s.uid === uid);
    if (!slot) return;
    slot.key = keyOrUrl;
    saveConfig(slots);

    const card = $(`.ai-card[data-uid="${uid}"]`);
    if (!card) return;
    const info = getSlotInfo(keyOrUrl);

    const titleEl = card.querySelector('.card-title');
    titleEl.title = escapeHtml(info.name);
    titleEl.innerHTML = `<span aria-hidden="true">${info.icon}</span><span>${escapeHtml(info.name)}</span>`;

    const iframe = card.querySelector('iframe');
    iframe.src = info.url;
    iframe.title = escapeHtml(info.name);

    const overlay = card.querySelector('.card-overlay');
    overlay.innerHTML = `
      <div class="ai-logo">${info.icon}</div>
      <div class="ai-name">${escapeHtml(info.name)}</div>
      <div class="ai-desc">${t('iframeHint')}</div>
      <a class="open-btn" href="${escapeHtml(info.url)}" target="_blank" rel="noopener">${t('openNew')}</a>
    `;
  }

  function reorderSlots(srcUid, targetUid) {
    const srcIndex = slots.findIndex(s => s.uid === srcUid);
    const targetIndex = slots.findIndex(s => s.uid === targetUid);
    if (srcIndex === -1 || targetIndex === -1) return;

    const [srcSlot] = slots.splice(srcIndex, 1);
    slots.splice(targetIndex, 0, srcSlot);
    saveConfig(slots);

    const container = $('.grid-2x2');
    const srcCard = $(`.ai-card[data-uid="${srcUid}"]`);
    const targetCard = $(`.ai-card[data-uid="${targetUid}"]`);
    if (srcCard && targetCard) {
      container.insertBefore(srcCard, targetCard);
    }
  }

  function openModal(uid) {
    editUid = uid;
    const isAdd = uid === null;
    const modal = $('.modal-backdrop');
    $('.modal-title').textContent = isAdd ? t('modalTitleAdd') : t('modalTitleEdit');

    const modalBody = $('.modal-body');
    modalBody.innerHTML = '';

    PRESET_GROUPS.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'preset-group';

      const titleEl = document.createElement('div');
      titleEl.className = 'preset-group-title';
      titleEl.textContent = groupTitle(group);
      groupEl.appendChild(titleEl);

      const gridEl = document.createElement('div');
      gridEl.className = 'preset-grid';

      group.keys.forEach(key => {
        const info = PRESETS[key];
        if (!info) return;
        const b = document.createElement('button');
        b.className = 'preset-btn';
        b.innerHTML = `<span class="p-name">${info.icon} ${escapeHtml(info.name)}</span><span class="p-url">${escapeHtml(info.url)}</span>`;
        b.addEventListener('click', () => {
          if (isAdd) insertSlot(key);
          else updateSlot(editUid, key);
          closeModal();
        });
        gridEl.appendChild(b);
      });

      if (gridEl.children.length > 0) {
        groupEl.appendChild(gridEl);
        modalBody.appendChild(groupEl);
      }
    });

    const customGroup = document.createElement('div');
    customGroup.className = 'preset-group';
    customGroup.innerHTML = `
      <div class="preset-group-title">${t('customUrl')}</div>
      <div class="form-group" style="margin-bottom:0;">
        <input class="form-input" id="customUrl" type="url" placeholder="https://example.com">
      </div>
    `;
    modalBody.appendChild(customGroup);

    modal.classList.add('open');
  }

  function closeModal() {
    $('.modal-backdrop').classList.remove('open');
    editUid = null;
  }

  function init() {
    renderSlots();

    const container = $('.grid-2x2');
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const uid = btn.dataset.uid;

      if (action === 'reload') {
        const card = btn.closest('.ai-card');
        const iframe = card.querySelector('iframe');
        iframe.src = iframe.src;
      } else if (action === 'open') {
        const slot = slots.find(s => s.uid === uid);
        if (slot) window.open(getSlotInfo(slot.key).url, '_blank', 'noopener,noreferrer');
      } else if (action === 'change') {
        openModal(uid);
      } else if (action === 'remove') {
        removeSlot(uid);
      } else if (action === 'add') {
        openModal(null);
      }
    });

    $('.modal-backdrop').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
    $('#modalClose').addEventListener('click', closeModal);
    $('#modalCancel').addEventListener('click', closeModal);
    $('#closeAllBtn')?.addEventListener('click', () => {
      slots = [];
      saveConfig(slots);
      const container = $('.grid-2x2');
      container.innerHTML = '';
      container.appendChild(createAddCard());
    });

    $('#modalSave').addEventListener('click', () => {
      const url = $('#customUrl').value.trim();
      if (url) {
        let final = url;
        if (!/^https?:\/\//i.test(final)) final = 'https://' + final;
        if (editUid === null) insertSlot(final);
        else updateSlot(editUid, final);
      }
      closeModal();
    });

    const langBtn = $('.lang-btn');
    const langMenu = $('.lang-menu');
    if (langBtn && langMenu) {
      langBtn.addEventListener('click', (e) => { e.stopPropagation(); langMenu.classList.toggle('open'); });
      document.addEventListener('click', () => langMenu.classList.remove('open'));
    }
    $$('.lang-menu a').forEach(link => {
      link.addEventListener('click', () => {
        try { localStorage.setItem('ai_agg_lang', link.getAttribute('href')); } catch (e) {}
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
