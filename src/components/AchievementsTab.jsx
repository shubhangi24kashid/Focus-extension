// src/components/AchievementsTab.jsx
import React from "react"

export default function AchievementsTab({ achievements }) {
  return (
    <div className="tab-content">
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? "unlocked" : ""}`}
          >
            <div className="achievement-icon">{achievement.unlocked ? "🏆" : "🔒"}</div>
            <div className="achievement-info">
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <div className="achievement-progress">
                <div className="progress-bar small">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(achievement.progress / achievement.target) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {achievement.progress}/{achievement.target}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
