console.log("🔄 Background script starting...");

// Timer state
const timerState = {
  seconds: 5,
  isRunning: false,
  currentMode: 0,
  interval: null,
};

// Timer modes
const TIMER_MODES = [
  { name: "Focus", duration: 5 },
  { name: "Short Break", duration: 3 },
  { name: "Long Break", duration: 8 },
  { name: "Deep Focus", duration: 10 },
];

function initTimer() {
  timerState.seconds = TIMER_MODES[timerState.currentMode].duration * 60;
  timerState.isRunning = false;
  if (timerState.interval) {
    clearInterval(timerState.interval);
    timerState.interval = null;
  }
  console.log("✅ Timer initialized:", timerState);
}

function startTimer() {
  console.log("🚀 Starting timer...");

  if (timerState.isRunning) {
    console.log("⚠️ Timer already running");
    return { success: true, ...timerState };
  }

  timerState.isRunning = true;
  if (timerState.interval) clearInterval(timerState.interval);

  timerState.interval = setInterval(() => {
    if (timerState.seconds > 0) {
      timerState.seconds--;
      console.log(`⏱️ Timer: ${timerState.seconds} seconds remaining`);
    }

    if (timerState.seconds <= 0) {
      console.log("⏰ Timer completed!");
      stopTimer();
      unblockSites();

      chrome.notifications?.create({
        type: "basic",
        iconUrl: "icon48.png",
        title: "Timer Complete!",
        message: `${TIMER_MODES[timerState.currentMode].name} session finished!`,
      });

      // ✅ Tell popup to show new tip
      chrome.runtime.sendMessage({ action: "sessionEnded" });
    }
  }, 1000);

  blockSites();
  console.log("✅ Timer started successfully");
  return { success: true, ...timerState };
}

function stopTimer() {
  console.log("⏸️ Stopping timer...");
  timerState.isRunning = false;
  if (timerState.interval) {
    clearInterval(timerState.interval);
    timerState.interval = null;
  }
  unblockSites();
  console.log("✅ Timer stopped");
  return { success: true, ...timerState };
}

function resetTimer() {
  console.log("🔄 Resetting timer...");
  stopTimer();
  timerState.seconds = TIMER_MODES[timerState.currentMode].duration * 60;
  console.log("✅ Timer reset to", timerState.seconds, "seconds");
  return { success: true, ...timerState };
}

function setTimerMode(mode, seconds) {
  console.log(`🔧 Setting timer mode to ${mode}, ${seconds} seconds`);
  stopTimer();
  timerState.currentMode = mode;
  timerState.seconds = seconds;
  console.log("✅ Timer mode set");
  return { success: true, ...timerState };
}

function getStatus() {
  return {
    success: true,
    seconds: timerState.seconds,
    isRunning: timerState.isRunning,
    currentMode: timerState.currentMode,
    modeName: TIMER_MODES[timerState.currentMode].name,
  };
}

async function blockSites() {
  try {
    console.log("🔒 Blocking sites...");
    const result = await chrome.storage.sync.get(["blockedSites"]);
    const sites = result.blockedSites || [];

    if (sites.length === 0) {
      console.log("No sites to block");
      return { success: true };
    }

    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIds = existingRules.map(rule => rule.id);

    if (ruleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: [],
      });
    }

    const rules = sites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*://*.${site}/*`,
        resourceTypes: ["main_frame"],
      },
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [],
      addRules: rules,
    });

    console.log("🔒 Sites blocked:", sites);
    return { success: true, blockedSites: sites };
  } catch (error) {
    console.error("❌ Error blocking sites:", error);
    return { success: false, error: error.message };
  }
}

async function unblockSites() {
  try {
    console.log("🔓 Unblocking sites...");
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIds = rules.map(rule => rule.id);

    if (ruleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: [],
      });
    }

    console.log("✅ All sites unblocked");
    return { success: true };
  } catch (error) {
    console.error("❌ Error unblocking sites:", error);
    return { success: false, error: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Background received message:", message);

  const handleAsync = async () => {
    try {
      let response;

      switch (message.action) {
        case "start":
          response = startTimer();
          break;
        case "pause":
        case "stop":
          response = stopTimer();
          break;
        case "reset":
          response = resetTimer();
          break;
        case "setTimer":
          response = setTimerMode(message.mode, message.seconds);
          break;
        case "getStatus":
        case "status":
          response = getStatus();
          break;
        case "block":
          response = await blockSites();
          break;
        case "unblock":
          response = await unblockSites();
          break;
        case "updateBlockList":
          await unblockSites();
          setTimeout(async () => {
            await blockSites();
          }, 100);
          response = { success: true };
          break;
        default:
          response = { success: false, error: "Unknown action: " + message.action };
      }

      console.log("📤 Background sending response:", response);
      sendResponse(response);
    } catch (error) {
      console.error("❌ Background error:", error);
      sendResponse({ success: false, error: error.message });
    }
  };

  handleAsync();
  return true;
});

initTimer();
console.log("✅ Background script loaded successfully");
