(() => {
  // Build ID for debugging - update this when making changes
  const BUILD_ID = "v0.0.3-" + new Date().toISOString().slice(0, 10);
  console.log(`🥽 Harper Glasses [${BUILD_ID}] initializing`);

  let container = null;
  let textarea = null;

  function createPopup() {
    // Avoid adding multiple times if the script runs again
    if (document.getElementById("cstpt-container")) {
      console.log(`🥽 Harper Glasses [${BUILD_ID}] popup already exists`);
      return document.getElementById("cstpt-container").querySelector("textarea");
    }

    container = document.createElement("div");
    container.id = "cstpt-container";

    // Calculate dimensions before creating elements
    const halfWidth = Math.floor(window.innerWidth / 2);
    const halfHeight = Math.floor(window.innerHeight / 2);

    // Visible and centered on screen
    Object.assign(container.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: `${halfWidth}px`,
      height: `${halfHeight}px`,
      zIndex: "2147483647",
      background: "white",
      border: "1px solid #ccc",
      padding: "4px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
      boxSizing: "border-box",
    });

    textarea = document.createElement("textarea");
    textarea.id = "cstpt-textarea";

    textarea.style.width = "100%";
    textarea.style.height = "100%";
    textarea.style.boxSizing = "border-box";

    textarea.rows = 6;   // can keep or drop, mostly overridden by explicit height
    textarea.cols = 40;  // same

    container.appendChild(textarea);
    
    document.body.appendChild(container);
    console.log(`🥽 Harper Glasses [${BUILD_ID}] popup created and visible on-screen`);

    // Listen for Escape key on this specific textarea
    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        // Remove the popup from DOM entirely
        container.remove();
        container = null;
        textarea = null;
        console.log(`🥽 Harper Glasses [${BUILD_ID}] popup removed (click glasses button to create new one)`);
      }
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