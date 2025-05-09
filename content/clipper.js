// content/clipper.js
// Markdown Page Clipper – контент-скрипт
(async () => {
  console.log('[MarkdownClipper] clipper.js start');

  /*-------------------------------------------------------
    1. Динамическая загрузка библиотек из пакета расширения
  -------------------------------------------------------*/
  const loadLib = async (path, globalName) => {
    if (window[globalName]) return;                     // уже загружена
    const url  = chrome.runtime.getURL(path);
    const text = await fetch(url).then(r => {
      if (!r.ok) throw new Error(`${path} HTTP ${r.status}`);
      return r.text();
    });
    try {
      (0, eval)(text);                                 // выполняем код
    } catch (e) {
      console.error(`[MarkdownClipper] ${globalName} eval error`, e);
      throw e;
    }
    if (!window[globalName]) {
      throw new Error(`${globalName} failed to register`);
    }
  };

  await loadLib('content/libs/readability.js', 'Readability');
  await loadLib('content/libs/turndown.js',  'TurndownService');

  /*-------------------------------------------------------
    2. Вспомогательные функции
  -------------------------------------------------------*/
  // 2.1 HTML выделенного пользователем фрагмента
  const getSelectedHtml = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0).cloneContents();
    const div = document.createElement('div');
    div.appendChild(range);
    return div.innerHTML.trim();
  };

  // 2.2 Главная статья через Readability
  const getMainArticleHtml = () => {
    const clone = document.cloneNode(true);
    const article = new Readability(clone).parse();
    return article ? article.content : '';
  };

  /*-------------------------------------------------------
    3. Определяем, что копировать
  -------------------------------------------------------*/
  let html = getSelectedHtml();
  if (!html || html.length < 30) html = getMainArticleHtml();

  if (!html) {
    alert('Markdown Page Clipper: не удалось извлечь содержимое.');
    return;
  }

  /*-------------------------------------------------------
    4. HTML → Markdown  (Turndown)
  -------------------------------------------------------*/
  const turndownService = new TurndownService({
    headingStyle:     'atx',
    bulletListMarker: '-',
    codeBlockStyle:   'fenced'
  });

  // Правило: <pre> →

   turndownService.addRule('preToCodeBlock', {
    filter: node => node.nodeName === 'PRE',
    replacement: content =>
      `\n\`\`\`\n${content.replace(/^\n+|\n+$/g, '')}\n\`\`\`\n`
  });

  const markdown = turndownService.turndown(html);

  /*-------------------------------------------------------
    5. Копируем в буфер обмена
  -------------------------------------------------------*/
  try {
    await navigator.clipboard.writeText(markdown);
  } catch (err) {
    console.error('[MarkdownClipper] clipboard write failed', err);
    alert('Markdown Page Clipper: не удалось записать в буфер.');
    return;
  }

  /*-------------------------------------------------------
    6. Тост-уведомление
  -------------------------------------------------------*/
  const TOAST_CSS = `
    .__mdclip_toast{
      all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483647;
      background:#323232;color:#fff;font:14px/1.35 -apple-system,BlinkMacSystemFont,
                 "Segoe UI",Roboto,sans-serif;
      padding:8px 12px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.3);
      opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s
    }
    .__mdclip_toast.show{opacity:1;transform:translateY(0)}
  `;
  if (!document.getElementById('__mdclip_style')) {
    const style = document.createElement('style');
    style.id = '__mdclip_style';
    style.textContent = TOAST_CSS;
    document.head.appendChild(style);
  }

  const toast = document.createElement('div');
  toast.className = '__mdclip_toast';
  toast.textContent = `✓ Скопировано ${markdown.split(/\s+/).length} слов`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.remove(), 2500);

  console.log('[MarkdownClipper] done, chars:', markdown.length);
})();
