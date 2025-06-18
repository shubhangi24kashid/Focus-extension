import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [seconds, setSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [tip, setTip] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    requestStatus();

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

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <h1>⏳ Pomodoro Timer</h1>
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
    </div>
  );
}
