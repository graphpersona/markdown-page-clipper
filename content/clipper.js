// content/clipper.js
// Markdown Page Clipper – основной скрипт (библиотеки уже в window)
(async () => {
  const log = (...a) => console.log('%c[MD-Clipper]', 'color:#03a9f4', ...a);
  const err = (...a) => console.error('%c[MD-Clipper]', 'color:#f44336', ...a);

  if (typeof Readability === 'undefined' || typeof TurndownService === 'undefined') {
    alert('Markdown Page Clipper: библиотеки не загрузились.');
    return;
  }

  /*---------------------------------------------
    1. Берём HTML: выделение или Readability
  ----------------------------------------------*/
  const sel = getSelection();
  let html = null;
  // переменные метаданных объявляем заранее
  let title   = '';
  const url   = location.href;
  const iso   = new Date().toISOString();
  let author  = '';
  let domain  = location.hostname;
  let lang    = document.documentElement.lang || '';
  
  if (sel && !sel.isCollapsed) {
    const range = sel.getRangeAt(0).cloneContents();
    const div = document.createElement('div');
    div.appendChild(range);
    html = div.innerHTML.trim();
    log('Используем выделенный фрагмент');
  }
  if (!html || html.length < 30) {
    log('Запускаем Readability');
    const article = new Readability(document.cloneNode(true)).parse();

    title = article.title?.trim() || '';
    author = article.byline || '';
    
    log('Readability ok, title =', title);
    html = article ? article.content : '';
    html = `<h1>${article.title}</h1>` +
      `<p><strong>Source:</strong> <a href="${url}">${url}</a></p>`+ 
      `<p><strong>Clipped:</strong> ${iso}</p>` +
      html;
  }
  if (!html) {
    alert('Markdown Page Clipper: не удалось извлечь содержимое.');
    return;
  }

  /*---------------------------------------------
    2. HTML → Markdown (Turndown)
  ----------------------------------------------*/
  const td = new TurndownService({
    headingStyle:     'atx',
    bulletListMarker: '-',
    codeBlockStyle:   'fenced'
  });
  td.addRule('preToCode', {
    filter: n => n.nodeName === 'PRE',
    replacement: c => `\n\`\`\`\n${c.replace(/^\n+|\n+$/g,'')}\n\`\`\`\n`
  });
  const bodymd = td.turndown(html);
  log('bodymd created');
  /*---------------------------------------------
    2.1. Add metadata YAML
  ----------------------------------------------*/
  log('Start create metadata');
  log('title ', title);
  log('url ', url);
  log('iso ', iso);
  log('domain ', domain);
  log('author ', author);
  log('lang ', lang);
  log('bodymd.length ', bodymd.length);
  const meta = {
    title: title,                                    // из Readability
    source: url,
    clipped: iso,
    domain: domain,
    author: author,             // может быть ""
    lang: lang,
    words: bodyMd.split(/\s+/).length      // именно количество слов,
  };
  log('Metadata: ', meta);
  /* ---------- YAML-шапка без фильтра пустых ---------- */
  const yaml = '---\n' +
    Object.entries(meta).map(([k,v]) => `${k}: ${v}`).join('\n') +
  '\n---\n\n';
  log('yaml created');
  md = yaml + bodymd;
  log('md created');
  /*---------------------------------------------
    3. Копируем в буфер
  ----------------------------------------------*/
  log('start clipboard');
  try {
    log('start clipboard try');
    await navigator.clipboard.writeText(md);
    log('✓ Скопировано в буфер, символов:', md.length);
  } catch (e) {
    err('Clipboard error', e);
    alert('Не удалось записать в буфер: ' + e.message);
    return;
  }

  /*---------------------------------------------
    4. Тост-уведомление
  ----------------------------------------------*/
  log('start tost');
  const css = `
    .__mdclip_toast{all:initial;position:fixed;right:20px;bottom:20px;
      z-index:2147483647;background:#323232;color:#fff;font:14px/1.35 sans-serif;
      padding:8px 12px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.3);
      opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s}
    .__mdclip_toast.show{opacity:1;transform:translateY(0)}
  `;
  if (!document.getElementById('__mdclip_style')) {
    const s = document.createElement('style');
    s.id = '__mdclip_style'; s.textContent = css; document.head.appendChild(s);
  }
  const toast = document.createElement('div');
  toast.className = '__mdclip_toast';
  log('get textContent');
  toast.textContent = `✓ Скопировано ${md.split(/\s+/).length} слов`;
  document.body.appendChild(toast);
  requestAnimationFrame(()=>toast.classList.add('show'));
  setTimeout(()=>toast.remove(), 2500);
})();
