// File: src/App.jsx
import React from "react";
import "./assets/App.css";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import StatsGrid from "./components/StatsGrid";
import TimerTab from "./components/TimerTab";
import SitesTab from "./components/SitesTab";
import AnalyticsTab from "./components/AnalyticsTab";
import AchievementsTab from "./components/AchievementsTab";
import SettingsTab from "./components/SettingsTab";
import usePomodoroLogic from "./hooks/usePomodoroLogic";

export default function App() {
  const logic = usePomodoroLogic();

  // Dynamically render tab content based on current tab
  const renderTab = () => {
    switch (logic.tab) {
      case "timer":
        return <TimerTab {...logic} />;
      case "sites":
        return <SitesTab {...logic} />;
      case "analytics":
        return <AnalyticsTab {...logic} />;
      case "achievements":
        return <AchievementsTab {...logic} />;
      case "settings":
        return <SettingsTab {...logic} />;
      default:
        return <div style={{ padding: "2rem" }}>🧪 Debug: Tab temporarily removed</div>;
    }
  };

  return (
    <div className={`app ${logic.darkMode ? "dark" : "light"}`}>
      {/* Connection Status Banner */}
      {logic.connectionStatus !== "connected" && logic.connectionStatus !== "dev-mode" && (
        <div className="debug-banner">
          <div className="debug-status">
            Status: {logic.connectionStatus}
            {logic.lastError && <span className="debug-error"> | Error: {logic.lastError}</span>}
          </div>
        </div>
      )}

      {/* Main UI */}
      <Header {...logic} />
      <StatsGrid {...logic} />
      <Tabs {...logic} />
      {renderTab()}

      {/* Dev Mode / Error Debug Info */}
      {(logic.connectionStatus === "dev-mode" || logic.connectionStatus === "error") && (
        <div className="debug-banner">
          Status: {logic.connectionStatus} | Extension: {logic.isExtension() ? "YES" : "NO"}
          {logic.lastError && <span> | Error: {logic.lastError}</span>}
        </div>
      )}

      {logic.connectionStatus === "error" && (
        <div className="debug-info">
          <p>
            <strong>Timer:</strong> {logic.formatTime?.(logic.seconds)} | {logic.isRunning ? "Running" : "Stopped"}
          </p>
          <p>
            <strong>Mode:</strong> {logic.timerModes?.[logic.currentMode]?.name || "Unknown"}
          </p>
          <p>
            <strong>Connection:</strong> {logic.connectionStatus}
          </p>

          <button onClick={logic.requestStatus} className="debug-btn">
            🔄 Test Connection
          </button>

          <div className="debug-logs">
            <h4>Recent Logs:</h4>
            {logic.debugLogs.map((log, index) => (
              <div key={index} className="debug-log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
