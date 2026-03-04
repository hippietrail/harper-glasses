(() => {
  // Build ID for debugging - update this when making changes
  const BUILD_ID = "v0.0.3-slashdot-fix-" + new Date().toISOString().slice(0, 10);
  console.log(`🥽 Harper Glasses [${BUILD_ID}] initializing`);

  let container = null;
  let textarea = null;
  let contentEditable = null;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let isResizing = false;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartWidth = 0;
  let resizeStartHeight = 0;
  let isUsingContentEditable = false;

  // Calculate contrast ratio between two RGB colors
  function getContrastRatio(rgb1, rgb2) {
    const getLuminance = (r, g, b) => {
      const [rs, gs, bs] = [r, g, b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Parse RGB string to array
  function parseRGB(rgbString) {
    const match = rgbString.match(/\d+/g);
    return match ? [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])] : null;
  }

  // Adjust colors for accessibility if needed
  function ensureContrast(bgColor, fgColor) {
    const bg = parseRGB(bgColor);
    const fg = parseRGB(fgColor);
    
    if (!bg || !fg) return { bgColor, fgColor }; // Fallback if parsing fails

    const ratio = getContrastRatio(bg, fg);
    
    // WCAG AA standard requires 4.5:1 for normal text
    if (ratio >= 4.5) {
      return { bgColor, fgColor };
    }

    // If contrast is poor, use safe defaults
    console.log(`🥽 Low contrast ratio (${ratio.toFixed(2)}:1), using safe colors`);
    return {
      bgColor: "rgb(255, 255, 255)",
      fgColor: "rgb(0, 0, 0)"
    };
  }

  // Toggle between textarea and contenteditable div
  function toggleEditMode() {
    if (!container) return;

    const wrapper = container.querySelector("#hgl-content-wrapper");
    if (!wrapper) return;

    const currentContent = isUsingContentEditable 
      ? contentEditable.textContent 
      : textarea.value;

    if (isUsingContentEditable) {
      // Switch to textarea
      contentEditable.remove();
      contentEditable = null;

      textarea = document.createElement("textarea");
      textarea.id = "hgl-textarea";
      textarea.value = currentContent;
      textarea.addEventListener("keydown", handleKeydown);
      wrapper.appendChild(textarea);
      textarea.focus();
      
      isUsingContentEditable = false;
      console.log(`🥽 Harper Glasses [${BUILD_ID}] switched to textarea mode`);
    } else {
      // Switch to contenteditable
      textarea.remove();
      textarea = null;

      contentEditable = document.createElement("div");
      contentEditable.id = "hgl-contenteditable";
      contentEditable.contentEditable = "true";
      contentEditable.textContent = currentContent;
      contentEditable.addEventListener("keydown", handleKeydown);
      wrapper.appendChild(contentEditable);
      contentEditable.focus();
      
      isUsingContentEditable = true;
      console.log(`🥽 Harper Glasses [${BUILD_ID}] switched to contenteditable mode`);
    }
  }

  // Handle keyboard shortcuts
  function handleKeydown(event) {
    // Ctrl+Shift+E to toggle edit mode
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") {
      event.preventDefault();
      toggleEditMode();
      return;
    }

    // Escape to close
    if (event.key === "Escape") {
      if (container) {
        const styleElement = document.getElementById("hgl-styles");
        if (styleElement) {
          styleElement.remove();
        }
      }
      container.remove();
      container = null;
      textarea = null;
      contentEditable = null;
      console.log(`🥽 Harper Glasses [${BUILD_ID}] popup removed via Escape key`);
    }
  }

  function createPopup() {
    // Avoid adding multiple times if the script runs again
    if (document.getElementById("hgl-container")) {
      console.log(`🥽 Harper Glasses [${BUILD_ID}] popup already exists`);
      return document.getElementById("hgl-container").querySelector("textarea");
    }

    container = document.createElement("div");
    container.id = "hgl-container";

    // Calculate dimensions before creating elements
    const halfWidth = Math.floor(window.innerWidth / 2);
    const halfHeight = Math.floor(window.innerHeight / 2);

    // Check contrast and adjust colors if needed
    const colors = ensureContrast("rgb(255, 255, 255)", "rgb(0, 0, 0)");

    // Create a scoped style element with specific CSS reset
    const style = document.createElement("style");
    style.id = "hgl-styles";
    style.textContent = `
      #hgl-container {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: ${halfWidth}px !important;
        height: ${halfHeight}px !important;
        z-index: 2147483647 !important;
        background: ${colors.bgColor} !important;
        color: ${colors.fgColor} !important;
        border: 1px solid #ccc !important;
        padding: 0 !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        margin: 0 !important;
        float: none !important;
        clear: both !important;
        vertical-align: baseline !important;
        line-height: normal !important;
        text-align: left !important;
        letter-spacing: normal !important;
        word-spacing: normal !important;
        min-width: 200px !important;
        min-height: 150px !important;
      }
      #hgl-titlebar {
        background-color: ${colors.fgColor === "rgb(0, 0, 0)" ? "#f0f0f0" : "#333"} !important;
        color: ${colors.fgColor} !important;
        padding: 8px 12px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        cursor: move !important;
        user-select: none !important;
        border-bottom: 1px solid #ccc !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        height: 32px !important;
        min-height: 32px !important;
        max-height: 32px !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        flex: 0 0 auto !important;
      }
      #hgl-titlebar span {
        font-size: 13px !important;
        font-weight: 500 !important;
        line-height: normal !important;
        margin: 0 !important;
        padding: 0 !important;
        display: inline-block !important;
        vertical-align: middle !important;
        color: inherit !important;
        pointer-events: none !important;
      }
      #hgl-titlebar button {
        background: none !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 20px !important;
        padding: 0 4px !important;
        color: inherit !important;
        width: 32px !important;
        height: 32px !important;
        min-width: 32px !important;
        min-height: 32px !important;
        max-width: 32px !important;
        max-height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 auto !important;
        margin: 0 !important;
        position: relative !important;
        right: 0 !important;
      }
      #hgl-content-wrapper {
        flex: 1 !important;
        overflow: hidden !important;
        padding: 4px !important;
        box-sizing: border-box !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
      }
      #hgl-textarea, #hgl-contenteditable {
        width: 100% !important;
        height: 100% !important;
        box-sizing: border-box !important;
        border: none !important;
        font-family: monospace !important;
        font-size: 13px !important;
        resize: none !important;
        padding: 8px !important;
        color: inherit !important;
        background: inherit !important;
        margin: 0 !important;
        display: block !important;
        flex: 1 !important;
      }
      #hgl-contenteditable {
        overflow: auto !important;
      }
      #hgl-status-bar {
        background-color: #f8f9fa !important;
        border-top: 1px solid #ccc !important;
        padding: 6px 12px !important;
        font-size: 12px !important;
        color: #666 !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        position: relative !important;
        flex: 0 0 auto !important;
        box-sizing: border-box !important;
        margin: 0 !important;
      }
      #hgl-resize {
        position: absolute !important;
        bottom: 0 !important;
        right: 0 !important;
        width: 20px !important;
        height: 20px !important;
        cursor: se-resize !important;
        background: linear-gradient(135deg, transparent 50%, #ccc 50%) !important;
        z-index: 10 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);

    // Watch for Harper installation/uninstallation
    const observer = new MutationObserver((mutations) => {
      const hasHarperChanges = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE && node.tagName === 'HARPER-RENDER-BOX'
        ) || Array.from(mutation.removedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE && node.tagName === 'HARPER-RENDER-BOX'
        );
      });
      
      if (hasHarperChanges) {
        console.log('🥽 Harper Glasses: detected Harper installation change, updating status');
        updateHarperStatus();
      }
    });

    // Create cleanup function
    const cleanup = () => {
      const styleElement = document.getElementById("hgl-styles");
      if (styleElement) {
        styleElement.remove();
      }
      observer.disconnect();
    };

    // Create title bar
    const titleBar = document.createElement("div");
    titleBar.id = "hgl-titlebar";

    const titleText = document.createElement("span");
    
    // Simple Harper installation detection
    const harperElement = document.querySelector('harper-render-box');
    console.log(`🥽 Harper Glasses: harper-render-box found: ${!!harperElement}`);
    
    const harperInstalled = !!harperElement;
    console.log(`🥽 Harper Glasses: Harper installed: ${harperInstalled}`);
    
    const statusIcon = harperInstalled ? '🪉😎' : '🪉😐';
    titleText.textContent = `${statusIcon} Harper Glasses`;
    titleBar.appendChild(titleText);

    // Create close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", () => {
      cleanup();
      container.remove();
      container = null;
      textarea = null;
      contentEditable = null;
      console.log(`🥽 Harper Glasses [${BUILD_ID}] popup closed via X button`);
    });
    titleBar.appendChild(closeBtn);

    container.appendChild(titleBar);

    // Create textarea wrapper for flex layout
    const textareaWrapper = document.createElement("div");
    textareaWrapper.id = "hgl-content-wrapper";

    textarea = document.createElement("textarea");
    textarea.id = "hgl-textarea";
    textarea.rows = 6;
    textarea.cols = 40;
    textarea.addEventListener("keydown", handleKeydown);

    textareaWrapper.appendChild(textarea);
    container.appendChild(textareaWrapper);

    // Create status bar
    const statusBar = document.createElement("div");
    statusBar.id = "hgl-status-bar";
    
    // Use the same simple Harper installation check
    statusBar.textContent = `Harper: ${harperInstalled ? 'Installed (check if enabled for this site)' : 'Not installed'}`;
    
    // Add resize handle to status bar
    const resizeHandle = document.createElement("div");
    resizeHandle.id = "hgl-resize";
    resizeHandle.textContent = "";
    
    statusBar.appendChild(resizeHandle);
    container.appendChild(statusBar);

    // Function to update Harper status
    function updateHarperStatus() {
      const harperElement = document.querySelector('harper-render-box');
      const newInstalled = !!harperElement;
      
      if (newInstalled !== harperInstalled) {
        console.log(`🥽 Harper Glasses: Harper installation status changed from ${harperInstalled} to ${newInstalled}`);
        
        // Update title bar
        const statusIcon = newInstalled ? '🪉😎' : '🪉😐';
        titleText.textContent = `${statusIcon} Harper Glasses`;
        
        // Update status bar
        statusBar.textContent = `Harper: ${newInstalled ? 'Installed (check if enabled for this site)' : 'Not installed'}`;
      }
    }

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Create resize handle - moved to status bar above

    isUsingContentEditable = false;

    document.body.appendChild(container);
    console.log(`🥽 Harper Glasses [${BUILD_ID}] popup created and visible on-screen`);
    console.log('🥽 Titlebar element:', titleBar);
    console.log('🥽 Resize handle element:', resizeHandle);
    console.log('🥽 Container element:', container);

    // Dragging logic
    titleBar.addEventListener("mousedown", (e) => {
      console.log('🥽 Titlebar mousedown detected');
      isDragging = true;
      const rect = container.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging && container) {
        console.log('🥽 Dragging in progress');
        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;
        container.style.setProperty('left', `${x}px`, 'important');
        container.style.setProperty('top', `${y}px`, 'important');
        container.style.setProperty('transform', 'none', 'important');
      }

      if (isResizing && container) {
        console.log('🥽 Resizing in progress');
        const newWidth = Math.max(200, resizeStartWidth + (e.clientX - resizeStartX));
        const newHeight = Math.max(150, resizeStartHeight + (e.clientY - resizeStartY));
        container.style.setProperty('width', `${newWidth}px`, 'important');
        container.style.setProperty('height', `${newHeight}px`, 'important');
      }
    });

    document.addEventListener("mouseup", () => {
      console.log('🥽 Mouseup detected');
      isDragging = false;
      isResizing = false;
    });

    // Resizing logic
    resizeHandle.addEventListener("mousedown", (e) => {
      console.log('🥽 Resize handle mousedown detected');
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;
      const rect = container.getBoundingClientRect();
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartWidth = rect.width;
      resizeStartHeight = rect.height;
    });

    return textarea;
  }

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message?.type === "GRAB_SELECTION") {
      // Create popup if it doesn't exist
      const ta = createPopup();
      
      // Grab current selection and update textarea
      const selection = window.getSelection();
      const text = selection ? selection.toString() : "";
      ta.value = text;

      console.log(`🥽 Harper Glasses [${BUILD_ID}] selection updated: ${text.length} characters`);

      // Focus textarea so user can edit and Harper checks it
      ta.focus();
    }
  });
})();
