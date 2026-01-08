# Implementation Summary: Harper + Harper Glasses Integration Fix

## Problem Statement
Harper Glasses (popup textarea extension) wasn't being grammar-checked by Harper (grammar checker) when users clicked the button on read-only web pages. The core issue: Harper only monitored elements that were visible on-screen, and the Glasses popup was initially hidden.

---

## Root Cause Analysis

### Harper's Visibility Filter
Harper uses `isVisible()` function (lint-framework) to determine which elements to monitor:
```typescript
// Returns false for:
- display: none
- visibility: hidden
- opacity: 0
- Elements with getBoundingClientRect() outside screen bounds
```

### Harper Glasses' Problem
Started the textarea container with `display: none` to keep it hidden until user clicks the button. This caused:
1. MutationObserver detects textarea is added to DOM ✓
2. `scan()` function runs and finds textarea ✓
3. `isVisible()` rejects it because of hidden state ✗
4. Textarea never added to Harper's linting targets ✗

---

## Solution Architecture

### Two-Part Fix

**Harper Glasses (Simple Extension)**
- Changed from `display: none` to off-screen positioning
- Added marker attribute `data-harper-glasses="true"` to textarea
- Show/hide via repositioning instead of CSS visibility

**Harper Extension (Complex Build)**
- Added `isVisibleOrMonitored()` helper function
- Content script recognizes marked textareas
- LintFramework uses new visibility check

---

## Code Changes

### 1. Harper Glasses (chrome-selection-to-popup-textarea)

**File: content.js**

```javascript
// BEFORE: display: none (hidden)
display: "none"

// AFTER: off-screen positioning with explicit dimensions
position: "fixed",
top: "-9999px",
left: "-9999px",
width: `${halfWidth}px`,
height: `${halfHeight}px`,

// NEW: Mark for Harper recognition
textarea.setAttribute("data-harper-glasses", "true");

// Show/hide by repositioning instead of display property
// Show:
container.style.top = "50%";
container.style.left = "50%";
container.style.transform = "translate(-50%, -50%)";

// Hide:
container.style.top = "-9999px";
container.style.left = "-9999px";
```

**Commits:**
- `b86a217`: Fix Harper detection by using off-screen positioning
- `de49cc3`: Mark textarea with data-harper-glasses attribute

---

### 2. Harper Extension (harper/packages)

#### a. lint-framework/src/lint/domUtils.ts

Added new visibility helper:
```typescript
export function isVisibleOrMonitored(node: Node): boolean {
    if (isVisible(node)) {
        return true;
    }

    // Allow monitoring of elements marked with data-harper-glasses attribute
    if (node instanceof Element && node.getAttribute('data-harper-glasses') === 'true') {
        return true;
    }

    return false;
}
```

#### b. lint-framework/src/lint/LintFramework.ts

Updated visibility check:
```typescript
// BEFORE:
onScreenTargets(): Node[] {
    for (const target of this.targets) {
        if (isVisible(target)) {
            onScreen.push(target);
        }
    }
}

// AFTER:
onScreenTargets(): Node[] {
    for (const target of this.targets) {
        if (isVisibleOrMonitored(target)) {
            onScreen.push(target);
        }
    }
}
```

#### c. chrome-plugin/src/contentScript/index.ts

Updated scan() function:
```typescript
function scan() {
    document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((element) => {
        // Allow Harper Glasses textareas to be monitored even if not visible
        const isHarperGlasses = element.getAttribute('data-harper-glasses') === 'true';

        if (
            (!isVisible(element) && !isHarperGlasses) ||
            element.getAttribute('data-enable-grammarly') === 'false' ||
            element.disabled ||
            element.readOnly
        ) {
            return;
        }

        fw.addTarget(element);
    });
    // ... rest of scan()
}
```

**Commits:**
- `eb5b2dd3`: Add support for Harper Glasses popup textarea monitoring (in both packages)
- `5ffd3c06`: Remove unused isVisible import

---

## How It Works Now

1. **Initialization**: Harper Glasses creates textarea off-screen with marker attribute
2. **Detection**: Harper's MutationObserver detects DOM change
3. **Recognition**: `scan()` finds textarea and allows it (due to marker)
4. **Monitoring**: LintFramework includes it in linting targets (via `isVisibleOrMonitored()`)
5. **User Action**: User clicks glasses button
6. **Display**: Container moves to center of screen
7. **Checking**: Harper's polling loop (100ms) continuously checks for grammar errors
8. **Feedback**: Grammar errors displayed in popup textarea
9. **Close**: Escape key moves textarea back off-screen

---

## Build Status

### Harper Glasses
- ✅ No build needed (pure JavaScript)
- ✅ Ready to load unpacked in Chrome
- ✅ All changes committed and pushed

### Harper Extension
- ✅ Build successful: `npm run build` in packages/chrome-plugin/
- ✅ Output: `packages/chrome-plugin/build/`
- ✅ Ready to load unpacked in Chrome
- ✅ All changes committed and pushed

---

## Testing Files Created

1. **TESTING_GUIDE.md** - Comprehensive testing instructions
2. **QUICK_TEST.md** - Quick reference for common tasks
3. **IMPLEMENTATION_SUMMARY.md** - This file

---

## Installation Instructions

### Harper Glasses (Quick)
```bash
chrome://extensions
  → Load unpacked
  → /Users/hippietrail/chrome-selection-to-popup-textarea
```

### Harper Extension (Build First)
```bash
cd /Users/hippietrail/harper-the-second/harper/packages/chrome-plugin
npm run build
# Then:
chrome://extensions
  → Load unpacked
  → /Users/hippietrail/harper-the-second/harper/packages/chrome-plugin/build
```

---

## Backwards Compatibility

✅ **Fully backwards compatible**
- Existing behavior unchanged for normal editable elements
- Only adds special handling for elements with marker attribute
- No changes to existing HTML/CSS requirements

---

## Key Design Decisions

1. **Off-screen positioning instead of display:none**
   - Allows `isVisible()` to work correctly
   - Element still has valid bounding rect
   - Simpler than modifying Harper's core logic

2. **Marker attribute instead of source detection**
   - Decoupled: Harper Glasses responsible for marking
   - Extensible: Other tools can use same marker
   - Explicit: Clear intent in HTML

3. **New function instead of modifying isVisible()**
   - Maintains Harper's original visibility semantics
   - Clear separation of concerns
   - Easy to remove if no longer needed

---

## Git History

**Harper Glasses:**
```
de49cc3 Mark textarea with data-harper-glasses attribute
b86a217 Fix Harper detection of Harper Glasses textarea
```

**Harper Extension:**
```
5ffd3c06 Remove unused isVisible import
eb5b2dd3 Add support for Harper Glasses popup textarea monitoring
```

---

## Testing Checklist

- [ ] Install both extensions in Chrome
- [ ] Test on read-only page (e.g., Wikipedia)
- [ ] Select problematic text
- [ ] Click Harper Glasses 👓 button
- [ ] Verify Harper shows grammar errors in popup
- [ ] Test Escape key to close
- [ ] Verify normal Harper functionality still works
- [ ] Check console for error messages

---

## Next Steps (Optional)

Future improvements not included in this fix:
- UI polish for Harper Glasses popup
- Custom grammar rules for Harper Glasses textareas
- Integration with Harper's suggestion system
- Settings to control Glasses behavior
- Context menu integration ("Check with Harper Glasses")

