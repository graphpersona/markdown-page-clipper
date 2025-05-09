// content/clipper.js
(async () => {

  /* ---------- 1. Runtime imports (UMD) --------- */
  // tiny CDNless loader; duplicates are ignored on re-injection
  const injectLib = (id, srcText) =>
    new Promise((res) => {
      if (document.getElementById(id)) return res();
      const s = Object.assign(document.createElement('script'),
        { id, textContent: srcText });
      document.documentElement.appendChild(s); res();
    });

  // Mozilla Readability (minified, 7 KB gz) – version 0.4.4
  await injectLib('__readability__', `/* Readability.js */${READABILITY_MINIFIED_SOURCE}`);

  // Turndown (UMD, 9 KB gz) – version 7.1.2
  await injectLib('__turndown__', `/* Turndown.js */${TURNDOWN_MINIFIED_SOURCE}`);

  /* ---------- 2. Helpers --------- */
  const getSelectedHtml = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0).cloneContents();
    const div = document.createElement('div');
    div.appendChild(range);
    return div.innerHTML.trim();
  };

  const getMainArticleHtml = () => {
    const docClone = document.cloneNode(true);
    const article = new Readability(docClone).parse();
    return article ? article.content : '';
  };

  /* ---------- 3. Choose fragment --------- */
  let html = getSelectedHtml();
  if (!html || html.length < 30) html = getMainArticleHtml();
  if (!html) return alert('Markdown Clipper: Could not extract content.');

  /* ---------- 4. HTML → Markdown --------- */
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  });
  // custom rule: preserve inline code inside <pre><code>
  turndownService.addRule('preToCodeBlock', {
    filter: node => node.tagName === 'PRE',
    replacement: (content) => `\n\`\`\`\n${content.replace(/^\n+|\n+$/g, '')}\n\`\`\`\n`
  });
  const markdown = turndownService.turndown(html);

  /* ---------- 5. Clipboard --------- */
  await navigator.clipboard.writeText(markdown);

  /* ---------- 6. Toast UI --------- */
  const toast = Object.assign(document.createElement('div'), {
    textContent: `✓ Copied ${markdown.split(/\s+/).length} words to clipboard`,
    className: '__mdclip_toast'
  });
  const css = `
  .__mdclip_toast{
    all:initial;position:fixed;z-index:2147483647;bottom:20px;right:20px;
    background:#323232;color:#fff;font:14px sans-serif;padding:8px 12px;
    border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.3);opacity:0;transition:opacity .3s}
  .__mdclip_toast.show{opacity:1}`;
  injectLib('__mdclip_styles',
    `(()=>{const s=document.createElement('style');s.textContent=\`${css}\`;document.head.appendChild(s)})();`);
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.remove(), 2500);

})();
