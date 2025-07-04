// src/components/TimerTab.jsx
import React from "react";

export default function TimerTab({
  timerModes = [],
  currentMode = 0,
  seconds = 0,
  isRunning = false,
  connectionStatus = "connected",
  formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
  switchMode = () => {},
  toggleTimer = () => {},
  resetTimer = () => {},
  progress = 0,
  tip = "",
  isLoadingTip = false,
  getNewTip = () => {},
}) {
  const current = timerModes[currentMode] || {
    name: "Mode",
    duration: 0,
    color: "gray",
    emoji: "❓"
  };

  return (
    <div className="tab-content">
      {/* Mode Selector */}
      <div className="mode-selector">
        {timerModes.map((mode, index) => (
          <button
            key={index}
            onClick={() => switchMode(index)}
            className={`mode-btn ${currentMode === index ? "active" : ""} bg-gradient-${mode.color || "gray"}`}
          >
            <span className="mode-emoji">{mode.emoji}</span>
            <span className="mode-name">{mode.name}</span>
            <span className="mode-duration">{mode.duration}s</span>
          </button>
        ))}
      </div>

      {/* Timer + Progress */}
      <div className="timer-container">
        <div className={`timer-display bg-gradient-${current.color}`}>
          {formatTime(seconds)}
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className={`progress-fill bg-gradient-${current.color}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="timer-controls">
          <button
            onClick={toggleTimer}
            className={`control-btn primary bg-gradient-${current.color}`}
            disabled={connectionStatus === "error"}
          >
            {isRunning ? "⏸️ Pause" : "▶️ Start"}
          </button>
          <button onClick={resetTimer} className="control-btn secondary">
            🔄 Reset
          </button>
        </div>

        {/* Connection Debug Info */}
        {connectionStatus === "error" && (
          <div className="debug-info">
            <p>Connection: {connectionStatus}</p>
            <p>
              Timer: {formatTime(seconds)} | Running: {isRunning ? "Yes" : "No"}
            </p>
          </div>
        )}

        {/* Productivity Tip Section */}
        {(tip || isLoadingTip) && (
          <div className="tip-container">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <div className="tip-header">
                <div className="tip-title">AI Tip</div>
                <button
                  onClick={getNewTip}
                  className="refresh-tip-btn"
                  disabled={isLoadingTip}
                  title="Get a new tip"
                >
                  {isLoadingTip ? "⏳" : "🔄"}
                </button>
              </div>
              <div className="tip-text">
                {isLoadingTip ? "Getting a fresh tip for you..." : tip}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
