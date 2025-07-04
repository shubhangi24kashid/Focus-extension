// src/components/SettingsTab.jsx
import React from "react"

export default function SettingsTab({
  autoBreak,
  setAutoBreak,
  focusIntensity,
  setFocusIntensity,
  weeklyGoal,
  setWeeklyGoal,
  backgroundSound,
  setBackgroundSound,
  connectionStatus,
  isExtension,
  formatTime,
  seconds,
  isRunning,
  clearSuggestionHistory,
  setTip,
  requestStatus,
}) {
  return (
    <div className="tab-content">
      <div className="settings-section">
        <h3>⚙️ Timer Settings</h3>

        <div className="setting-item">
          <div className="setting-info">
            <label>Auto-start breaks</label>
            <p>Automatically start break timers after focus sessions</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoBreak}
              onChange={async (e) => {
                setAutoBreak(e.target.checked)
                if (isExtension()) {
                  await chrome.storage.sync.set({ autoBreak: e.target.checked })
                }
              }}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Focus Intensity: {focusIntensity}x</label>
            <p>Higher intensity blocks more distracting websites</p>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.5"
            value={focusIntensity}
            onChange={async (e) => {
              const value = Number.parseFloat(e.target.value)
              setFocusIntensity(value)
              if (isExtension()) {
                await chrome.storage.sync.set({ focusIntensity: value })
              }
            }}
            className="slider"
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Weekly Goal: {weeklyGoal} sessions</label>
            <p>Set your weekly focus session target</p>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={weeklyGoal}
            onChange={async (e) => {
              const value = Number.parseInt(e.target.value)
              setWeeklyGoal(value)
              if (isExtension()) {
                await chrome.storage.sync.set({ weeklyGoal: value })
              }
            }}
            className="slider"
          />
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Background Sound</label>
            <p>Choose ambient sounds for focus sessions</p>
          </div>
          <select
            value={backgroundSound}
            onChange={async (e) => {
              setBackgroundSound(e.target.value)
              if (isExtension()) {
                await chrome.storage.sync.set({ backgroundSound: e.target.value })
              }
            }}
            className="select"
          >
            <option value="none">None</option>
            <option value="rain">Rain</option>
            <option value="forest">Forest</option>
            <option value="ocean">Ocean Waves</option>
            <option value="cafe">Coffee Shop</option>
            <option value="white-noise">White Noise</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Clear AI Suggestion History</label>
            <p>Reset suggestion history for testing</p>
          </div>
          <button
            onClick={() => {
              clearSuggestionHistory()
              setTip("")
              alert("Suggestion history cleared!")
            }}
            className="debug-btn"
          >
            Clear History
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Debug Information</label>
            <p>Connection: {connectionStatus}</p>
            <p>Extension Context: {isExtension() ? "Yes" : "No"}</p>
            <p>
              Timer State: {formatTime(seconds)} ({isRunning ? "Running" : "Stopped"})
            </p>
          </div>
          <button onClick={requestStatus} className="debug-btn">
            Test Connection
          </button>
        </div>
      </div>
    </div>
  )
}
