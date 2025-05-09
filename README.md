# markdown-page-clipper

🚀 Markdown Page Clipper – Design & MVP Implementation Guide
This blueprint will get you from 0→1 with a fully-working V1 (MVP) that:

• Lets the user click the toolbar icon
• Detects the “main article” or, if text is selected, uses the selection
• Converts the HTML to Markdown with Turndown + a few custom rules
• Copies the result to the clipboard and shows a toast

After that you’ll see V2 ideas and cross-browser notes.

────────────────────────────────────────

Functional Scope ──────────────────────────────────────── V1 (MVP)
Browser-action button (“Clip page to Markdown”).
Auto-detect main content (using Mozilla Readability).
If the user has an active DOM selection ≥ 10 chars, prefer that fragment.
Convert to GitHub-flavoured Markdown.
Copy to clipboard (no file download).
1-line toast: “✓ Copied X words of Markdown”.
V2 (Next Iteration)
• Right-click context-menu (“Clip selection as Markdown”).
• Options page with toggles (GFM tables, heading style, code fencing).
• Keyboard shortcut.
• Export to file (.md) or open a new tab with the Markdown for inspection.
• Dark-mode toast, i18n strings, analytics-free error reporting.

──────────────────────────────────────── 2. Directory / File Layout ──────────────────────────────────────── 
markdown-page-clipper/ 
│ 
├─ manifest.json 
├─ background.js 
← service-worker (injects/receives) 
├─ content/ 
  ← everything injected 
  │ 
  ├─ clipper.js 
  ← main logic (Readability + Turndown) │ 
  └─ toast.css 
  └─ assets/ 
  └─ icon-128.png
