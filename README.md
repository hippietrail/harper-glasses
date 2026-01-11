# Harper Glasses Extension

A Chrome extension that adds a popup textarea for checking text on read-only websites using the Harper grammar checker.

## How It Works

1. Click the Harper Glasses 👓 button on any webpage
2. A textarea popup appears with your selected text (if any)
3. Harper automatically checks for grammar/spelling errors
4. Press Escape to close the popup

## Architecture

**Harper Glasses** (this extension):
- Creates popup textarea on-screen at runtime
- Marks textarea with `data-harper-glasses="true"` attribute
- Uses off-screen positioning for hidden state (not `display: none`)

**Harper Integration**:
- Harper recognizes the marker attribute
- `isVisibleOrMonitored()` function allows monitoring off-screen marked elements
- Grammar checker runs on popup textarea just like normal form fields

## Building & Testing

### Setup Harper Glasses
```bash
cd /Users/hippietrail/harper-glasses
# No build needed - load directly in Chrome
chrome://extensions → Load unpacked → /Users/hippietrail/harper-glasses
```

### Build Harper Extension
```bash
cd /Users/hippietrail/harper-the-second/harper
just build-chrome-plugin
# Output: packages/chrome-plugin/build/
```

Then load both in Chrome at `chrome://extensions`.

### Quick Test
1. Visit Wikipedia or any read-only site
2. Select text (e.g., "me and him is happy")
3. Click 👓 button
4. Harper should show grammar errors in popup

### Development Mode (Hot Reload)
```bash
cd /Users/hippietrail/harper-the-second/harper
just dev-chrome-plugin
```
Changes auto-reload—just edit and refresh the extension.

## Key Files

**Harper Glasses:**
- `content.js` - Creates/manages popup textarea
- `manifest.json` - Extension config

**Harper Integration:**
- `harper/packages/lint-framework/src/lint/domUtils.ts` - `isVisibleOrMonitored()` function
- `harper/packages/lint-framework/src/lint/LintFramework.ts` - Uses new visibility check
- `harper/packages/chrome-plugin/src/contentScript/index.ts` - Scans for marked textareas

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Harper doesn't check popup | Verify `data-harper-glasses="true"` on textarea in DevTools Inspector |
| Popup doesn't appear | Check DevTools console for errors, refresh extension |
| Extension won't load | Verify `manifest.json` is valid, check chrome://extensions details |
