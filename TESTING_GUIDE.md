# Testing Guide: Harper + Harper Glasses

This guide explains how to build and install both extensions locally for testing their integration.

## Harper Glasses Extension (Simple)

### Build
Harper Glasses is a simple manifest v3 extension with no build step required. The files are ready to load directly.

```bash
cd /Users/hippietrail/chrome-selection-to-popup-textarea
# No build needed - files are ready as-is
```

### Install in Chrome

1. Open Chrome and navigate to: **chrome://extensions**
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the directory: `/Users/hippietrail/chrome-selection-to-popup-textarea`
5. The extension should appear with ID visible

### Verify Installation
- Chrome menu → Extensions → Harper Glasses 👓 should be visible
- Should have a 👓 button in the toolbar

---

## Harper Extension (Complex Build)

### Prerequisites
The Harper project is a monorepo using PNPM workspaces. You need to be in the right directory.

### Build Steps

Harper uses `just` (a command runner) for building. Run from the Harper repo root:

```bash
cd /Users/hippietrail/harper-the-second/harper
just build-chrome-plugin
```

This command:
1. Builds the WASM grammar checker (`harper-wasm`)
2. Builds the JavaScript library (`harper.js`)
3. Builds the lint framework (`lint-framework`)
4. Builds the Chrome extension itself

**Build takes 1-2 minutes** and outputs to `packages/chrome-plugin/build/` directory containing:
- `manifest.json` - Extension configuration
- `assets/` - CSS and JavaScript bundles
- `vendor/` - WASM and other vendored code
- `wasm/` - Grammar checking WASM binary

### Install in Chrome

1. Open Chrome: **chrome://extensions**
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select: `/Users/hippietrail/harper-the-second/harper/packages/chrome-plugin/build`
5. The extension should appear as "Private Grammar Checker - Harper"

### Verify Installation
- Chrome menu → Extensions → "Private Grammar Checker - Harper" should be visible
- Should have an "H" icon in the toolbar

### Development Mode (Hot Reload)

If you want to test changes without full rebuilds:

```bash
cd /Users/hippietrail/harper-the-second/harper
just dev-chrome-plugin
```

This:
1. Builds all dependencies (WASM, harper.js, lint-framework)
2. Starts a Vite dev server with hot module reloading
3. The extension will auto-refresh as you make changes

Leave this running in a terminal, edit your source files, and refresh the Chrome extension or page to see changes immediately.

---

## Testing the Integration

### Test Scenario 1: Harper Glasses on Read-Only Content

1. Visit a website with read-only text (e.g., Wikipedia, article, blog post)
2. Select some text that you suspect has grammar issues
3. Click the Harper Glasses 👓 button in Chrome toolbar
4. A popup should appear with the selected text in an editable textarea
5. **Expected:** Harper should detect the textarea and show grammar/spelling errors as you type

**Before the fix:** Harper wouldn't check the textarea because the page had no editable elements initially.
**After the fix:** Harper should check it due to the `data-harper-glasses` marker.

### Test Scenario 2: Verify Harper Still Works Normally

1. Visit Gmail, Medium, or any site with editable content
2. Click in a text field or compose area
3. **Expected:** Harper should detect and check the editable area (existing behavior, should not change)

### Test Scenario 3: Test With Both Extensions

1. Install both extensions
2. Visit a read-only page (Wikipedia works great)
3. Select problematic text with grammar errors (e.g., "me and him is going" or "its nice")
4. Click 👓 button
5. Harper should immediately highlight errors in the popup textarea
6. **Expected:** Green/red underlines appear, hovering shows suggestions

### Debugging

**Check Extension Console:**
- Chrome menu → Extensions → Harper Glasses 👓 → Details
- Click "inspect views: service worker" to see console logs
- Same for Harper extension

**Check Content Script Logs:**
- Open DevTools (F12) on any webpage
- Go to Console tab
- Look for messages like "chrome-selection-to-popup-textarea: injected textarea"

**Check that scan() is running:**
- In DevTools Console on a normal page with editable content, you should see Harper active
- On Harper Glasses popup, check the service worker console

---

## Rebuild & Reinstall Checklist

After making changes:

### For Harper Glasses:
1. Edit files in `/Users/hippietrail/chrome-selection-to-popup-textarea/`
2. **No build needed** - just refresh the extension:
   - Go to chrome://extensions
   - Find Harper Glasses
   - Click the refresh ↻ button
3. Test immediately

### For Harper Extension:
1. Edit source files in `/Users/hippietrail/harper-the-second/harper/packages/`
2. Run `npm run build` in `packages/chrome-plugin/`
3. Refresh in chrome://extensions (or use dev mode with hot reload)
4. Test immediately

---

## Key Files to Monitor During Testing

**Harper Glasses:**
- `content.js` - Injects textarea into page
- `manifest.json` - Extension permissions
- Check for `data-harper-glasses="true"` attribute in DOM

**Harper Extension:**
- `packages/chrome-plugin/src/contentScript/index.ts` - Scans for editable elements
- `packages/lint-framework/src/lint/domUtils.ts` - Contains `isVisibleOrMonitored()` check
- `packages/lint-framework/src/lint/LintFramework.ts` - Uses visibility check

---

## Troubleshooting

**Harper doesn't check Harper Glasses textarea:**
- Check service worker console for errors
- Verify `data-harper-glasses="true"` attribute is on textarea in DOM (DevTools Inspector)
- Verify both extensions are enabled in chrome://extensions
- Rebuild Harper: `npm run build`
- Clear browser cache / restart Chrome

**Harper Glasses popup doesn't appear:**
- Check DevTools console for "injected textarea" message
- Verify Harper Glasses is enabled in chrome://extensions
- Refresh the page

**Extension won't load:**
- Check console errors in chrome://extensions details
- Verify all dependencies installed: `cd harper && pnpm install`
- Ensure Node 14+ with `node --version`

