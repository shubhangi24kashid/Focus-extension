import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [tip, setTip] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [tab, setTab] = useState("timer");

  const [blockedSites, setBlockedSites] = useState([]);
  const [newSite, setNewSite] = useState("");

  // Load timer and session info
  useEffect(() => {
    requestStatus();

    chrome.storage.sync.get(["blockedSites"], (res) => {
      setBlockedSites(res.blockedSites || []);
    });

    const listener = (msg) => {
      if (msg.action === "update") {
        setSeconds(msg.seconds);
        setIsRunning(msg.isRunning);
        if (msg.seconds === 0) {
          setSessionCount((prev) => prev + 1);
          const tips = [
            "Take a short walk ✨",
            "Drink a glass of water 💧",
            "Stretch your body 🏋️",
            "Do deep breathing 🧘",
            "Look at something 20 feet away for 20 seconds 👁",
          ];
          setTip(tips[Math.floor(Math.random() * tips.length)]);
        }
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const requestStatus = () => {
    chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
      setSeconds(res.seconds);
      setIsRunning(res.isRunning);
    });
  };

  const toggleTimer = () => {
    chrome.runtime.sendMessage({ action: isRunning ? "pause" : "start" });
    chrome.runtime.sendMessage({ action: "block" });
  };

  const reset = () => {
    chrome.runtime.sendMessage({ action: "reset" });
    setTip("");
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const addSite = () => {
    if (!newSite.trim()) return;
    const updated = [...blockedSites, newSite.trim()];
    chrome.storage.sync.set({ blockedSites: updated }, () => {
      setBlockedSites(updated);
      setNewSite("");
      chrome.runtime.sendMessage({ action: "updateBlockList" });
    });
  };

  const removeSite = (site) => {
    const updated = blockedSites.filter(s => s !== site);
    chrome.storage.sync.set({ blockedSites: updated }, () => {
      setBlockedSites(updated);
      chrome.runtime.sendMessage({ action: "updateBlockList" });
    });
  };

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="tabs">
        <button onClick={() => setTab("timer")}>⏳ Timer</button>
        <button onClick={() => setTab("sites")}>🚫 Blocked Sites</button>
      </div>

      {tab === "timer" ? (
        <>
          <h1>Pomodoro Timer</h1>
          <div className="timer">{formatTime(seconds)}</div>
          <div className="controls">
            <button onClick={toggleTimer} className="start-btn">
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={reset} className="reset-btn">Reset</button>
            <button onClick={toggleTheme} className="theme-btn">
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
          <div className="session-count">🌟 Sessions: {sessionCount}</div>
          {tip && <div className="tip">💡 Tip: {tip}</div>}
        </>
      ) : (
        <>
          <h2>Blocked Sites</h2>
          <input
            type="text"
            value={newSite}
            placeholder="e.g. facebook.com"
            onChange={(e) => setNewSite(e.target.value)}
          />
          <button onClick={addSite}>Add</button>
          <ul>
            {blockedSites.map(site => (
              <li key={site}>
                {site}
                <button onClick={() => removeSite(site)}>❌</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
