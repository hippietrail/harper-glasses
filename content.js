(() => {
  // Avoid adding multiple times if the script runs again
  if (document.getElementById("cstpt-container")) {
    return;
  }

  const container = document.createElement("div");
  container.id = "cstpt-container";

  // Calculate dimensions before creating elements
  const halfWidth = Math.floor(window.innerWidth / 2);
  const halfHeight = Math.floor(window.innerHeight / 2);

  // Start off-screen so it's hidden but visible to Harper's grammar checker.
  // Harper's isVisible() check looks at getBoundingClientRect() and CSS properties,
  // so we need the element to have valid dimensions, even if off-screen initially.
  Object.assign(container.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
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

  console.log("chrome-selection-to-popup-textarea: injected textarea");

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message?.type === "GRAB_SELECTION") {
      // Show the panel - move it to center of screen
      container.style.top = "50%";
      container.style.left = "50%";
      container.style.transform = "translate(-50%, -50%)";

      // Grab current selection
      const selection = window.getSelection();
      const text = selection ? selection.toString() : "";
      textarea.value = text;

      // Optional: focus textarea so other extension sees active caret
      textarea.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      // Hide panel - move it off-screen
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.transform = "";
    }
  });
})();