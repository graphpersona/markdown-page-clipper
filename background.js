// background.js (MV3 service-worker)

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  // Menu item for entire page
  chrome.contextMenus.create({
    id: "clip-page",
    title: "Convert entire page to Markdown",
    contexts: ["page"]
  });

  // Menu item for selected text
  chrome.contextMenus.create({
    id: "clip-selection",
    title: "Convert selection to Markdown",
    contexts: ["selection"]
  });
});

// Function to inject clipper scripts
async function injectClipper(tab, selectionMode = false) {
  console.log(`[MarkdownClipper] clipper called for tab: ${tab.id}, selection mode: ${selectionMode}`);
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/libs/readability.js',
              'content/libs/turndown.js']
    });

    if (selectionMode) {
      // For selection mode, we use custom parameters
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Force selection mode in the clipper script
          window.__mdclipperUseSelection = true;
        }
      });
    }

    // Execute the main clipper script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/clipper.js']
    });

    console.log('[MarkdownClipper] clipper.js injected OK');
  } catch (e) {
    console.error('Markdown Clipper injection failed:', e);
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clip-page") {
    injectClipper(tab, false);
  } else if (info.menuItemId === "clip-selection") {
    injectClipper(tab, true);
  }
});

// Handle toolbar icon click (original functionality)
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[MarkdownClipper] toolbar icon clicked, tab:', tab.id);
  injectClipper(tab);
});
