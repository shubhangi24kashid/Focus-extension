// src/components/AnalyticsTab.jsx
import React from "react"

export default function AnalyticsTab({ todaysSessions, weeklyGoal, focusStreak }) {
  const percentage = Math.round((todaysSessions / weeklyGoal) * 100)

  return (
    <div className="tab-content">
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>📈 Weekly Progress</h3>
          <div className="progress-ring">
            <div className="progress-value">{percentage}%</div>
            <div className="progress-label">of weekly goal</div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>🔥 Focus Streak</h3>
          <div className="streak-display">
            <div className="streak-number">{focusStreak}</div>
            <div className="streak-label">days</div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>⏱️ Today's Sessions</h3>
          <div className="session-breakdown">
            <div className="session-count">{todaysSessions}</div>
            <div className="session-time">{todaysSessions * 25} minutes</div>
          </div>
        </div>
      </div>
    </div>
  )
}
