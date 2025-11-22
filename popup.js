document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("grab-selection");

  button.addEventListener("click", async () => {
    // Find the active tab in the current window
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      return;
    }

    // Send a message to the content script in that tab
    chrome.tabs.sendMessage(tab.id, { type: "GRAB_SELECTION" });
  });
});