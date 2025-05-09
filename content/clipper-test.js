// content/clipper-test.js
(async () => {
  console.log('[MarkdownClipper] TEST script injected');
  try {
    await navigator.clipboard.writeText('### Markdown TEST\n\n*It works!*');
    alert('Тестовое Markdown скопировано!');
  } catch(e) {
    console.error('Clipboard error:', e);
    alert('Не удалось записать в буфер: ' + e.message);
  }
})();
