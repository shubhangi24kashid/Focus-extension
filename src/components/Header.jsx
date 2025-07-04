// File: src/components/Header.jsx
import React from "react";

export default function Header({
  currentMode = 0,
  timerModes = [],
  cycle = 1,
  darkMode = false,
  soundEnabled = true,
  toggleTheme = () => {},
  toggleSound = () => {},
}) {
  const mode = timerModes?.[currentMode] || { name: "Unknown", color: "gray", emoji: "❓" };

  return (
    <div className="header">
      <div className="header-left">
        <div className={`mode-indicator bg-gradient-${mode.color}`}>
          <span className="mode-emoji">{mode.emoji}</span>
        </div>
        <div className="header-info">
          <h1>Focus Flow</h1>
          <p>
            Cycle {cycle} • {mode.name}
          </p>
        </div>
      </div>
      <div className="header-controls">
        <button onClick={toggleSound} className="icon-btn" title="Toggle Sound">
          {soundEnabled ? "🔊" : "🔇"}
        </button>
        <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme">
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}
