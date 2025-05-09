// background.js (MV3 service-worker)
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[MarkdownClipper] toolbar icon clicked, tab:', tab.id);
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/clipper.js']
    });
    console.log('[MarkdownClipper] clipper.js injected OK');
  } catch (e) {
    console.error('Markdown Clipper injection failed:', e);
  }
});
