// src/components/Tabs.jsx
import React from "react"

export default function Tabs({ tab, setTab }) {
  const tabList = [
    { id: "timer", label: "⏳ Timer" },
    { id: "sites", label: "🚫 Sites" },
    { id: "analytics", label: "📊 Stats" },
    { id: "achievements", label: "🏆 Rewards" },
    { id: "settings", label: "⚙️ Settings" },
  ]

  return (
    <div className="tabs">
      {tabList.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`tab ${tab === id ? "active" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
