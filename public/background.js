console.log("🔄 Background script starting...");

const timerState = {
    seconds: 5,
    isRunning: false,
    currentMode: 0,
    interval: null,
};

const TIMER_MODES = [
    { name: "Focus", duration: 5 },
    { name: "Short Break", duration: 3 },
    { name: "Long Break", duration: 8 },
    { name: "Deep Focus", duration: 10 },
];

function initTimer() {
    timerState.seconds = TIMER_MODES[timerState.currentMode].duration * 60;
    timerState.isRunning = false;
    clearInterval(timerState.interval);
    timerState.interval = null;
    console.log("✅ Timer initialized:", timerState);
}

function startTimer() {
    console.log("🚀 Starting timer...");

    if (timerState.isRunning) return { success: true, ...timerState };

    timerState.isRunning = true;
    clearInterval(timerState.interval);

    timerState.interval = setInterval(() => {
        if (timerState.seconds > 0) {
            timerState.seconds--;
            console.log(`⏱️ Timer: ${timerState.seconds} seconds remaining`);
        }
        if (timerState.seconds <= 0) {
            console.log("⏰ Timer completed!");
            stopTimer();

            chrome.notifications?.create({
                type: "basic",
                iconUrl: "icon48.png",
                title: "Timer Complete!",
                message: `${TIMER_MODES[timerState.currentMode].name} session finished!`,
            });

            chrome.runtime.sendMessage({ action: "sessionEnded" });
        }
    }, 1000);

    console.log("✅ Timer started successfully");
    return { success: true, ...timerState };
}

function stopTimer() {
    console.log("⏸️ Stopping timer...");
    timerState.isRunning = false;
    clearInterval(timerState.interval);
    timerState.interval = null;
    return { success: true, ...timerState };
}

function resetTimer() {
    console.log("🔄 Resetting timer...");
    stopTimer();
    timerState.seconds = TIMER_MODES[timerState.currentMode].duration * 60;
    return { success: true, ...timerState };
}

function setTimerMode(mode, seconds) {
    console.log(`🔧 Setting timer mode to ${mode}, ${seconds} seconds`);
    stopTimer();
    timerState.currentMode = mode;
    timerState.seconds = seconds;
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
    console.log("🔒 Blocking sites...");
    const { blockedSites } = await chrome.storage.sync.get("blockedSites");

    let rules = [];
    (blockedSites || []).forEach((domain, index) => {
        const ruleIdBase = 1000 + index * 2;

        rules.push({
            id: ruleIdBase,
            priority: 1,
            action: { type: "block" },
            condition: {
                urlFilter: `||${domain}/*`,
                resourceTypes: ["main_frame"],
            },
        });

        rules.push({
            id: ruleIdBase + 1,
            priority: 1,
            action: { type: "block" },
            condition: {
                urlFilter: `||*.${domain}/*`,
                resourceTypes: ["main_frame"],
            },
        });
    });

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: Array.from({ length: 1000 }, (_, i) => 1000 + i),
        addRules: rules,
    });

    console.log("🚫 Sites blocked:", blockedSites);
    return { success: true };
}


async function unblockSites() {
    console.log("🔓 Unblocking all sites...");
    const idsToRemove = Array.from({ length: 500 }, (_, i) => 1000 + i);

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: idsToRemove,
        addRules: [],
    });

    console.log("✅ All sites unblocked.");
    return { success: true };
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
                    await blockSites();
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
blockSites();
console.log("✅ Background script loaded successfully");
