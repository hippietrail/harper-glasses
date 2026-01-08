# Quick Testing Commands

## Build Harper (Proper Way)
```bash
cd /Users/hippietrail/harper-the-second/harper
just build-chrome-plugin
```
Output: `packages/chrome-plugin/build/` directory ready to load in Chrome

**OR** for hot-reload development mode:
```bash
cd /Users/hippietrail/harper-the-second/harper
just dev-chrome-plugin
```
This starts the Vite dev server with auto-reload

## Install Extensions

1. **Harper Glasses** (no build needed):
   - chrome://extensions → Load unpacked
   - Select: `/Users/hippietrail/chrome-selection-to-popup-textarea`

2. **Harper**:
   - chrome://extensions → Load unpacked
   - Select: `/Users/hippietrail/harper-the-second/harper/packages/chrome-plugin/build`

## Test Integration

1. Visit Wikipedia or read-only website
2. Select some text (e.g., "Me and him is happy")
3. Click Harper Glasses 👓 button
4. Textarea appears with selected text
5. **Result:** Harper should show grammar errors (e.g., red underline on "Me and him is")

## Debugging

Check logs:
```
Chrome DevTools → Console (on any page with textarea)
Extension Details → "inspect views: service worker" (for background script)
```

Look for:
- "chrome-selection-to-popup-textarea: injected textarea"
- Grammar error highlights in Harper Glasses popup
- `data-harper-glasses="true"` attribute on textarea (DevTools Inspector)

## After Code Changes

**Harper Glasses (simple):**
- Edit file in `/chrome-selection-to-popup-textarea/`
- chrome://extensions → refresh ↻
- Test

**Harper (complex - build then reload):**
- Edit source in `/harper/packages/`
- Run from Harper root: `just build-chrome-plugin`
- chrome://extensions → refresh ↻
- Test

**Harper (dev mode - hot reload):**
- From Harper root: `just dev-chrome-plugin`
- Leave running, edit source files
- Changes auto-reload in Chrome, just refresh extension or page
- Press Ctrl+C to stop when done
