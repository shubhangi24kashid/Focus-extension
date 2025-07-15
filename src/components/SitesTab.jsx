// src/components/SitesTab.jsx
import React from "react"

export default function SitesTab({
  blockedSites,
  newSite,
  setNewSite,
  addSite,
  removeSite,
}) {
  return (
   <div className="sites-tab-content">
  <div className="section-header">
    <h2>🚫 Blocked Sites</h2>
    <p>These sites will be blocked during focus sessions</p>
  </div>

  <div className="add-site-container">
    <input
      type="text"
      value={newSite}
      placeholder="Enter website (e.g., facebook.com)"
      onChange={(e) => setNewSite(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && addSite()}
      className="site-input"
    />
    <button onClick={addSite} className="add-btn">
      ➕ Add
    </button>
  </div>

  <div className="sites-list">
    {blockedSites.map((site) => (
      <div key={site} className="site-item">
        <span className="site-name">{site}</span>
        <button onClick={() => removeSite(site)} className="remove-btn">
          ❌
        </button>
      </div>
    ))}
  </div>

  {blockedSites.length === 0 && (
    <div className="empty-state">
      <div className="empty-icon">🚫</div>
      <p>No blocked sites yet</p>
      <small>Add websites to block during focus sessions</small>
    </div>
  )}
</div>

  )
}
