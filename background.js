// background.js (MV3 service-worker)
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/clipper.js']
    });
  } catch (e) {
    console.error('Markdown Clipper injection failed:', e);
  }
});
