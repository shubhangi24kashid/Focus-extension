// src/components/StatsGrid.jsx
import React from "react"

export default function StatsGrid({
  focusStreak,
  todaysSessions,
  weeklyGoal,
  sessionCount
}) {
  const stats = [
    { title: "Focus Streak", value: focusStreak },
    { title: "Today's Sessions", value: todaysSessions },
    { title: "Weekly Goal", value: `${sessionCount}/${weeklyGoal}` },
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-title">{stat.title}</div>
          <div className="stat-value">{stat.value}</div>
        </div>
      ))}
    </div>
  )
}
