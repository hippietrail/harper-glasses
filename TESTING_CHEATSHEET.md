# Testing Cheatsheet: Harper + Harper Glasses

## One-Command Setup

### Build Harper Extension
```bash
cd ~/harper-the-second/harper && just build-chrome-plugin
```
✓ Builds: WASM → harper.js → lint-framework → chrome-plugin  
✓ Output: `packages/chrome-plugin/build/` ready to load

### Install in Chrome
1. `chrome://extensions`
2. Load unpacked: `/Users/hippietrail/chrome-selection-to-popup-textarea`
3. Load unpacked: `/Users/hippietrail/harper-the-second/harper/packages/chrome-plugin/build`

## Test It

1. Visit **Wikipedia** (or any read-only site)
2. Select text (e.g., "Me and him are happy")
3. Click **Harper Glasses 👓** button
4. **Expected:** Harper highlights grammar errors in popup (red underline)

## Iterate (Dev Mode)

```bash
cd ~/harper-the-second/harper && just dev-chrome-plugin
```

- Starts auto-reload server
- Edit source, changes appear immediately
- Press Ctrl+C to stop

## Rebuild After Changes

```bash
# Just the extension (no dependencies)
cd ~/harper-the-second/harper/packages/chrome-plugin && npm run build

# Full rebuild (dependencies + extension)  
cd ~/harper-the-second/harper && just build-chrome-plugin

# Harper Glasses (no build needed, just refresh)
```

Then refresh extension in chrome://extensions.

## Debug

| Task | Command |
|------|---------|
| Check console logs | DevTools → F12 → Console |
| Check extension logs | chrome://extensions → Details → "inspect views: service worker" |
| Find data attribute | DevTools Inspector → Look for `data-harper-glasses="true"` |
| Check if textarea exists | DevTools → Find `#cstpt-textarea` element |

## Key Files

**Harper Glasses:**
- `/chrome-selection-to-popup-textarea/content.js` - Creates textarea
- Check for `data-harper-glasses="true"` attribute

**Harper:**
- `/harper/packages/lint-framework/src/lint/domUtils.ts` - `isVisibleOrMonitored()` function
- `/harper/packages/lint-framework/src/lint/LintFramework.ts` - Uses visibility check
- `/harper/packages/chrome-plugin/src/contentScript/index.ts` - Scans for textareas

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No grammar errors appear | Check: Both extensions enabled? Textarea has marker attribute? Rebuild Harper? |
| Glasses button doesn't work | Check: Refresh extension, check DevTools console |
| Build fails | Run `just build-chrome-plugin` from Harper root (not from subdirectory) |
| Want clean rebuild | Delete `build/` folder, run `just build-chrome-plugin` again |

