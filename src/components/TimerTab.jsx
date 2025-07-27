"use client"

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
  // Enhanced timer modes with correct durations
  const enhancedTimerModes = [
    { name: "Quick Focus", duration: 120, color: "emerald", emoji: "⚡", type: "focus" },
    { name: "Focus 10m", duration: 600, color: "cyan", emoji: "📚", type: "focus" },
    { name: "Focus 15m", duration: 900, color: "blue", emoji: "🎯", type: "focus" },
    { name: "Pomodoro", duration: 1500, color: "purple", emoji: "🍅", type: "focus" },
    { name: "Short Break", duration: 300, color: "orange", emoji: "☕", type: "break" },
    { name: "Long Break", duration: 900, color: "yellow", emoji: "🌴", type: "break" },
  ]

  const modes = enhancedTimerModes
  const safeCurrentMode = Math.min(Math.max(currentMode, 0), modes.length - 1)
  const current = modes[safeCurrentMode]

  return (
    <div className="timer-tab-content">
      {/* Enhanced Mode Selector - 6 Buttons with Fixed Colors */}
      <div className="timer-mode-grid">
        {modes.map((mode, index) => {
          const isActive = safeCurrentMode === index
          const minutes = Math.floor(mode.duration / 60)

          return (
            <button
              key={index}
              onClick={() => switchMode(index)}
              className={`timer-mode-btn ${isActive ? "active" : ""}`}
              style={{
                background: isActive ? getGradientStyle(mode.color) : "var(--bg-card)",
                color: isActive ? "#ffffff" : "var(--text-primary)",
                border: isActive ? "none" : "2px solid var(--border-color)",
              }}
              title={`${mode.name} - ${minutes} minutes`}
            >
              <div className="mode-emoji-small">{mode.emoji}</div>
              <div className="mode-info-small">
                <div className="mode-name-small">{mode.name}</div>
                <div className="mode-time-small">{minutes}m</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Timer Display */}
      <div className="timer-container">
        <div
          className="timer-display"
          style={{
            background: getGradientStyle(current.color),
            color: "#ffffff",
          }}
        >
          {formatTime(seconds)}
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                background: getGradientStyle(current.color),
              }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="timer-controls">
          <button
            onClick={toggleTimer}
            className="control-btn primary"
            style={{
              background: getGradientStyle(current.color),
              color: "#ffffff",
            }}
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
                <button onClick={getNewTip} className="refresh-tip-btn" disabled={isLoadingTip}>
                  {isLoadingTip ? "⏳" : "🔄"}
                </button>
              </div>
              <div className="tip-text">{isLoadingTip ? "Getting a fresh tip for you..." : tip}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for gradient styles
function getGradientStyle(color) {
  const gradients = {
    emerald: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    cyan: "linear-gradient(135deg, #06b6d4 0%, #38bdf8 100%)",
    blue: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    purple: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
    orange: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
    yellow: "linear-gradient(135deg, #eab308 0%, #facc15 100%)",
  }
  return gradients[color] || gradients.purple
}
