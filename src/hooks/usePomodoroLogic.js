import { useEffect, useState, useRef } from "react";
import { getAISuggestion, clearSuggestionHistory } from "../api/aiSuggest";

const DEFAULT_MODES = [
  { name: "Focus", duration: 1500, color: "red", emoji: "🎯" },
  { name: "Break", duration: 300, color: "blue", emoji: "☕" },
];

export default function usePomodoroLogic(timerModes = DEFAULT_MODES, achievementsData = []) {
  const safeTimerModes = timerModes.length > 0 ? timerModes : DEFAULT_MODES;

  const [currentMode, setCurrentMode] = useState(0);
  const [seconds, setSeconds] = useState(safeTimerModes[0]?.duration || 1500);
  const [isRunning, setIsRunning] = useState(false);
  const [tip, setTip] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [tab, setTab] = useState("timer");
  const [blockedSites, setBlockedSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [cycle, setCycle] = useState(1);
  const [focusStreak, setFocusStreak] = useState(0);
  const [todaysSessions, setTodaysSessions] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(25);
  const [autoBreak, setAutoBreak] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [backgroundSound, setBackgroundSound] = useState("none");
  const [focusIntensity, setFocusIntensity] = useState(1);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [lastError, setLastError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [debugLogs, setDebugLogs] = useState([]);
  const [achievements, setAchievements] = useState(achievementsData);

  const intervalRef = useRef(null);

  const isExtension = () => {
    return typeof window !== "undefined" && window.chrome && window.chrome.runtime;
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    console.log("🐛", logEntry);
    setDebugLogs((prev) => [...prev.slice(-4), logEntry]);
  };

  useEffect(() => {
    addLog(`Extension context: ${isExtension() ? "YES" : "NO"}`);
    loadStoredData();
    requestStatus();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (seconds <= 0 && isRunning) {
      setIsRunning(false);
    }
  }, [seconds, isRunning]);

  useEffect(() => {
    const newSeconds = safeTimerModes[currentMode]?.duration || 1500;
    setSeconds(newSeconds);
  }, [currentMode]);

  const sendMessage = (action, data = {}) => {
    return new Promise((resolve) => {
      addLog(`Sending: ${action}`);
      if (!isExtension()) {
        addLog("Dev mode simulation");
        setConnectionStatus("dev-mode");
        setTimeout(() => {
          let mockResponse = { success: true };
          if (action === "start") mockResponse = { success: true, isRunning: true, seconds };
          else if (action === "pause") mockResponse = { success: true, isRunning: false, seconds };
          else if (action === "status") mockResponse = { success: true, isRunning, seconds, currentMode };
          resolve(mockResponse);
        }, 100);
        return;
      }

      try {
        window.chrome.runtime.sendMessage({ action, ...data }, (response) => {
          if (window.chrome.runtime.lastError) {
            const error = window.chrome.runtime.lastError.message;
            addLog(`Chrome error: ${error}`);
            setLastError(error);
            setConnectionStatus("error");
            resolve({ success: false, error });
          } else {
            setConnectionStatus("connected");
            setLastError("");
            resolve(response || { success: false });
          }
        });
      } catch (error) {
        setLastError(error.message);
        setConnectionStatus("error");
        resolve({ success: false, error: error.message });
      }
    });
  };

  const loadStoredData = async () => {
    if (isExtension()) {
      try {
        const result = await window.chrome.storage.sync.get([
          "blockedSites", "focusStreak", "todaysSessions", "darkMode",
          "weeklyGoal", "autoBreak", "soundEnabled", "achievements",
          "sessionCount", "currentMode"
        ]);
        setBlockedSites(result.blockedSites || []);
        setFocusStreak(result.focusStreak || 0);
        setTodaysSessions(result.todaysSessions || 0);
        setDarkMode(result.darkMode || false);
        setWeeklyGoal(result.weeklyGoal || 25);
        setAutoBreak(result.autoBreak !== false);
        setSoundEnabled(result.soundEnabled !== false);
        setSessionCount(result.sessionCount || 0);

        const modeIndex = result.currentMode ?? 0;
        const safeIndex = modeIndex < safeTimerModes.length ? modeIndex : 0;
        setCurrentMode(safeIndex);

        if (result.achievements) setAchievements(result.achievements);
      } catch (error) {
        addLog("Error loading stored data");
      }
    }
  };

  const requestStatus = async () => {
    const response = await sendMessage("status");
    if (response?.success) {
      setSeconds(response.seconds);
      setIsRunning(response.isRunning);
      if (response.currentMode !== undefined) setCurrentMode(response.currentMode);
    }
  };

  const toggleTimer = async () => {
    const action = isRunning ? "pause" : "start";
    const response = await sendMessage(action);
    if (response?.success) {
      setIsRunning(response.isRunning);
      if (response.seconds !== undefined) setSeconds(response.seconds);
    } else {
      setLastError(`Failed to ${action} timer`);
    }
  };

  const resetTimer = async () => {
    const response = await sendMessage("reset");
    if (response?.success) {
      setSeconds(response.seconds);
    } else {
      setSeconds(safeTimerModes[currentMode]?.duration || 1500);
    }
    setIsRunning(false);
    setTip("");
  };

  const switchMode = async (modeIndex) => {
    const newSeconds = safeTimerModes[modeIndex]?.duration || 1500;
    setCurrentMode(modeIndex);
    setSeconds(newSeconds);
    setIsRunning(false);
    await sendMessage("setTimer", { mode: modeIndex, seconds: newSeconds });
  };

  const getNewTip = async () => {
    setIsLoadingTip(true);
    try {
      const suggestion = await getAISuggestion();
      setTip(suggestion);
    } catch {
      setTip("Take a deep breath and appreciate this moment of accomplishment!");
    } finally {
      setIsLoadingTip(false);
    }
  };

  return {
    seconds,
    isRunning,
    tip,
    tab,
    blockedSites,
    darkMode,
    cycle,
    currentMode,
    sessionCount,
    focusStreak,
    todaysSessions,
    weeklyGoal,
    autoBreak,
    soundEnabled,
    backgroundSound,
    focusIntensity,
    achievements,
    isLoadingTip,
    connectionStatus,
    lastError,
    debugLogs,
    newSite,
    timerModes: safeTimerModes,
    setTab,
    setNewSite,
    toggleTimer,
    resetTimer,
    switchMode,
    getNewTip,
    setDarkMode,
    setSoundEnabled,
    setWeeklyGoal,
    setFocusIntensity,
    setAutoBreak,
    setBackgroundSound,
    clearSuggestionHistory,
    isExtension,
    sendMessage,
    requestStatus,
    setTip,
    setAchievements,
    setBlockedSites,
    setSeconds,
    setSessionCount,
    setTodaysSessions,
    setFocusStreak,
    setCurrentMode,
    setCycle
  };
}
