# Harper Glasses Extension

A Chrome extension that adds a popup textarea for checking text on read-only websites using the Harper grammar checker.

## How It Works

1. Click the Harper Glasses 👓 button on any webpage
2. A popup appears with your selected text (if any)
3. Status bar indicates if Harper is installed. (But we can't yet detect if it's enabled for the current site.)
4. Harper automatically checks for grammar/spelling errors
5. Press Escape or click ✕ to close

## Features

- **Harper Detection** - Automatically detects Harper installation status
- **Drag & Resize** - Move and resize the popup window

## Installation

```bash
# Load Harper Glasses
cd /Users/hippietrail/harper-glasses
chrome://extensions → Load unpacked → /Users/hippietrail/harper-glasses

# Build and load Harper (optional)
cd /Users/hippietrail/harper-the-second/harper
just build-chrome-plugin
# Load both extensions in chrome://extensions
```

## Testing

1. Visit any read-only site (Wikipedia, etc.)
2. Select text you want to check for spelling and grammar errors
3. Click 👓 button - popup shows Harper status
4. Use Haper as per usual. Note that this won't actually modify the website - it's just for checking

## Development

```bash
# Harper development mode (auto-reload)
cd /Users/hippietrail/harper-the-second/harper
just dev-chrome-plugin
```

## Files

- `content.js` - Main extension logic with Harper detection
- `manifest.json` - Extension configuration

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Harper status shows 🪉😐 | Install Harper extension and enable it for the current site |
| Popup doesn't appear | Check DevTools console for errors, refresh extension |
| Extension won't load | Verify `manifest.json` is valid, check chrome://extensions details |
