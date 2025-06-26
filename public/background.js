let seconds = 1500;
let isRunning = false;
let interval = null;

function broadcastUpdate() {
  chrome.runtime.sendMessage({
    action: "update",
    seconds,
    isRunning,
  });
}

function startTimer() {
  if (interval) return;
  console.log("⏱️ Timer started");
  isRunning = true;

  interval = setInterval(() => {
    seconds--;
    broadcastUpdate();

    if (seconds <= 0) {
      clearInterval(interval);
      interval = null;
      isRunning = false;
      chrome.runtime.sendMessage({ action: "unblock" });
    }
  }, 1000);
}

function pauseTimer() {
  console.log("⏸️ Timer paused");
  isRunning = false;
  clearInterval(interval);
  interval = null;
  broadcastUpdate();
}

function resetTimer() {
  console.log("🔄 Timer reset");
  seconds = 1500;
  isRunning = false;
  clearInterval(interval);
  interval = null;
  broadcastUpdate();
}

function applyBlockingRules() {
  chrome.storage.sync.get(["blockedSites"], (res) => {
    const sites = res.blockedSites || [];

    // Create rules with unique IDs starting from 100
    const rules = sites.map((site, index) => ({
      id: 100 + index,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: site,
        resourceTypes: ["main_frame"],
      },
    }));

    const ruleIdsToRemove = rules.map(r => r.id);

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: ruleIdsToRemove,
        addRules: rules,
      },
      () => console.log("🔒 Sites blocked:", sites)
    );
  });
}

function removeBlockingRules() {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const ruleIds = rules.map((r) => r.id).filter(id => id >= 100);
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: ruleIds,
        addRules: [],
      },
      () => console.log("✅ All dynamic rules removed")
    );
  });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Message received:", message);

  if (message.action === "start") startTimer();
  if (message.action === "pause") pauseTimer();
  if (message.action === "reset") resetTimer();
  if (message.action === "getStatus") {
    sendResponse({ seconds, isRunning });
  }
  if (message.action === "block") applyBlockingRules();
  if (message.action === "unblock") removeBlockingRules();
  if (message.action === "updateBlockList") {
    removeBlockingRules(); // Clean up
    setTimeout(() => applyBlockingRules(), 200); // Delay to ensure clean removal
  }
});
