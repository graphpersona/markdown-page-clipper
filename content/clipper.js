// content/clipper.js  (verbose debug edition)
(async () => {
  const log = (...args) => console.log('%c[MD-Clipper]', 'color:#03a9f4', ...args);
  const err = (...args) => console.error('%c[MD-Clipper]', 'color:#f44336', ...args);

  /* ---------------- 1. loadLib ----------------- */
  const loadLib = async (path, globalName) => {
    if (window[globalName]) { log(globalName, 'уже загружен'); return; }
    const url = chrome.runtime.getURL(path);
    log('Загружаем', path, '→', url);
    const res = await fetch(url);
    log(path, 'HTTP', res.status);
    if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
    const js = await res.text();
    try { (0, eval)(js); }
    catch (e) { err('eval провалился для', path, e); throw e; }
    if (!window[globalName]) throw new Error(`${globalName} не появился в window`);
    log(globalName, 'успешно зарегистрирован');
  };

  try {
    await loadLib('libs/readability.js', 'Readability');
    await loadLib('libs/turndown.js',  'TurndownService');
  } catch (e) {
    err('Не удалось загрузить библиотеки → выходим');
    alert('Markdown Page Clipper: библиотеки не найдены.\n' + e);
    return;
  }

  /* --------------- 2. выбор HTML --------------- */
  const getSelectedHtml = () => {
    const sel = getSelection();
    if (!sel || sel.isCollapsed) return null;
    const frag = sel.getRangeAt(0).cloneContents();
    const div  = document.createElement('div');
    div.appendChild(frag); return div.innerHTML.trim();
  };
  const getMainArticleHtml = () => {
    const clone = document.cloneNode(true);
    const art = new Readability(clone).parse();
    return art ? art.content : '';
  };

  let html = getSelectedHtml();
  log('Выделенный HTML', html ? html.slice(0,60)+'…' : '—');
  if (!html || html.length < 30) {
    log('Используем Readability');
    html = getMainArticleHtml();
  }

  if (!html) { err('html пустой'); alert('Не удалось извлечь контент'); return; }

  /* --------------- 3. Turndown ----------------- */
  log('Создаём TurndownService');
  const td = new TurndownService();
  const md = td.turndown(html);
  log('Markdown длина', md.length);

  /* --------------- 4. Clipboard ---------------- */
  try {
    await navigator.clipboard.writeText(md);
    log('✓ скопировано в буфер');
  } catch (e) {
    err('Clipboard error', e);
    alert('Не удалось записать в буфер: '+e);
    return;
  }

  /* --------------- 5. Toast -------------------- */
  const toast = document.createElement('div');
  toast.textContent = '✓ Скопировано ('+md.length+' симв.)';
  Object.assign(toast.style, {
    all:'initial',position:'fixed',right:'20px',bottom:'20px',background:'#323232',
    color:'#fff',padding:'8px 12px',borderRadius:'4px',font:'14px sans-serif',
    zIndex:2147483647,opacity:0,transition:'opacity .25s'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(()=>toast.style.opacity=1);
  setTimeout(()=>toast.remove(),2500);
})();
