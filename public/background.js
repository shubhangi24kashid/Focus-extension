let seconds = 1500;
let isRunning = false;
let interval = null;
const RULE_ID = 1;

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
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const alreadyExists = rules.some(rule => rule.id === RULE_ID);

    if (!alreadyExists) {
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: RULE_ID,
            priority: 1,
            action: { type: "block" },
            condition: {
              urlFilter: "facebook.com",
              resourceTypes: ["main_frame"]
            }
          }
        ],
        removeRuleIds: []
      }, () => console.log("🔒 Site blocked"));
    } else {
      console.log("⚠️ Rule already exists. Skipping re-add.");
    }
  });
}

function removeBlockingRules() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: []
  }, () => console.log("✅ Site unblocked"));
}

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
});
