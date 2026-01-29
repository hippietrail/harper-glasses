(() => {
  // Build ID for debugging - update this when making changes
  const BUILD_ID = "v0.0.4-" + new Date().toISOString().slice(0, 10);
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

    const wrapper = container.querySelector("[style*='flex: 1']");
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
      Object.assign(textarea.style, {
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        border: "none",
        fontFamily: "monospace",
        fontSize: "13px",
        resize: "none",
        padding: "8px",
        color: container.style.color,
        backgroundColor: container.style.backgroundColor,
      });
      textarea.value = currentContent;
      textarea.addEventListener("keydown", handleKeydown);
      wrapper.insertBefore(textarea, wrapper.querySelector("#hgl-resize"));
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
      Object.assign(contentEditable.style, {
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        border: "none",
        fontFamily: "monospace",
        fontSize: "13px",
        padding: "8px",
        color: container.style.color,
        backgroundColor: container.style.backgroundColor,
        overflow: "auto",
      });
      contentEditable.textContent = currentContent;
      contentEditable.addEventListener("keydown", handleKeydown);
      wrapper.insertBefore(contentEditable, wrapper.querySelector("#hgl-resize"));
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

    // Visible and centered on screen
    Object.assign(container.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: `${halfWidth}px`,
      height: `${halfHeight}px`,
      zIndex: "2147483647",
      background: colors.bgColor,
      color: colors.fgColor,
      border: "1px solid #ccc",
      padding: "0",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      fontFamily: "system-ui, -apple-system, sans-serif",
    });

    // Create title bar
    const titleBar = document.createElement("div");
    titleBar.id = "hgl-titlebar";
    Object.assign(titleBar.style, {
      backgroundColor: colors.fgColor === "rgb(0, 0, 0)" ? "#f0f0f0" : "#333",
      color: colors.fgColor,
      padding: "8px 12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "move",
      userSelect: "none",
      borderBottom: "1px solid #ccc",
      fontSize: "13px",
      fontWeight: "500",
      minHeight: "32px",
    });

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
    Object.assign(closeBtn.style, {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "20px",
      padding: "0 4px",
      color: colors.fgColor,
      minWidth: "32px",
      minHeight: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto",
    });
    closeBtn.addEventListener("click", () => {
      container.remove();
      container = null;
      textarea = null;
      console.log(`🥽 Harper Glasses [${BUILD_ID}] popup closed via X button`);
    });
    titleBar.appendChild(closeBtn);

    container.appendChild(titleBar);

    // Create textarea wrapper for flex layout
    const textareaWrapper = document.createElement("div");
    Object.assign(textareaWrapper.style, {
      flex: "1",
      overflow: "hidden",
      padding: "4px",
      boxSizing: "border-box",
      position: "relative",
    });

    textarea = document.createElement("textarea");
    textarea.id = "hgl-textarea";
    Object.assign(textarea.style, {
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      border: "none",
      fontFamily: "monospace",
      fontSize: "13px",
      resize: "none", // We handle resize manually
      padding: "8px",
      color: colors.fgColor,
      backgroundColor: colors.bgColor,
    });

    textarea.rows = 6;
    textarea.cols = 40;
    textarea.addEventListener("keydown", handleKeydown);

    textareaWrapper.appendChild(textarea);
    container.appendChild(textareaWrapper);

    // Create status bar
    const statusBar = document.createElement("div");
    Object.assign(statusBar.style, {
      backgroundColor: "#f8f9fa",
      borderTop: "1px solid #ccc",
      padding: "6px 12px",
      fontSize: "12px",
      color: "#666",
      fontFamily: "system-ui, -apple-system, sans-serif",
    });
    
    // Use the same simple Harper installation check
    statusBar.textContent = `Harper: ${harperInstalled ? 'Installed (check if enabled for this site)' : 'Not installed'}`;
    
    // Add resize handle to status bar
    const resizeHandle = document.createElement("div");
    resizeHandle.id = "hgl-resize";
    resizeHandle.textContent = "";
    Object.assign(resizeHandle.style, {
      position: "absolute",
      bottom: "0",
      right: "0",
      width: "20px",
      height: "20px",
      cursor: "se-resize",
      background: "linear-gradient(135deg, transparent 50%, #ccc 50%)",
      zIndex: "10",
    });
    
    // Make status bar relative positioning for resize handle
    statusBar.style.position = "relative";
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
        console.log(`🥽 Harper Glasses: detected Harper installation change, updating status`);
        updateHarperStatus();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Create resize handle - moved to status bar above

    isUsingContentEditable = false;

    document.body.appendChild(container);
    console.log(`🥽 Harper Glasses [${BUILD_ID}] popup created and visible on-screen`);

    // Dragging logic
    titleBar.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = container.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging && container) {
        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        container.style.transform = "none"; // Remove centering transform
      }

      if (isResizing && container) {
        const newWidth = Math.max(200, resizeStartWidth + (e.clientX - resizeStartX));
        const newHeight = Math.max(150, resizeStartHeight + (e.clientY - resizeStartY));
        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      isResizing = false;
    });

    // Resizing logic
    resizeHandle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
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
