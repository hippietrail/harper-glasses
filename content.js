(() => {
  // Build ID for debugging - update this when making changes
  const BUILD_ID = "v0.0.2-" + new Date().toISOString().slice(0, 10);
  console.log(`🥽 Harper Glasses [${BUILD_ID}] initializing`);

  // Avoid adding multiple times if the script runs again
  if (document.getElementById("cstpt-container")) {
    console.log(`🥽 Harper Glasses [${BUILD_ID}] already injected, skipping`);
    return;
  }

  const container = document.createElement("div");
  container.id = "cstpt-container";

  // Calculate dimensions before creating elements
  const halfWidth = Math.floor(window.innerWidth / 2);
  const halfHeight = Math.floor(window.innerHeight / 2);

  // Start visible and centered on screen so Harper can detect and check it immediately
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

  const textarea = document.createElement("textarea");
  textarea.id = "cstpt-textarea";

  textarea.style.width = "100%";
  textarea.style.height = "100%";
  textarea.style.boxSizing = "border-box";

  textarea.rows = 6;   // can keep or drop, mostly overridden by explicit height
  textarea.cols = 40;  // same

  container.appendChild(textarea);
  document.body.appendChild(container);

  console.log(`🥽 Harper Glasses [${BUILD_ID}] textarea injected and ready (visible on-screen)`);

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message?.type === "GRAB_SELECTION") {
      // Grab current selection and update textarea
      const selection = window.getSelection();
      const text = selection ? selection.toString() : "";
      textarea.value = text;

      console.log(`🥽 Harper Glasses [${BUILD_ID}] selection updated: ${text.length} characters`);

      // Focus textarea so user can edit and Harper checks it
      textarea.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      // Hide the popup by removing it from DOM
      // (User can click glasses button again to show it with new selection)
      container.style.display = "none";
      console.log(`🥽 Harper Glasses [${BUILD_ID}] popup hidden (press glasses button to show again)`);
    }
  });
})();