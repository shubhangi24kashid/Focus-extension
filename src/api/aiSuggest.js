import axios from "axios"

const getAPIKey = () => import.meta.env.VITE_OPENAI_API_KEY

// Fallback Suggestions
const fallbackTips = [
  "Take 5 deep breaths and stretch your arms above your head to reset your energy.",
  "Look away from your screen and focus on something 20 feet away for 20 seconds.",
  "Stand up and do 10 gentle neck rolls to release tension.",
  "Drink a glass of water and take a moment to appreciate your progress.",
  "Step outside for 2 minutes and take in some fresh air.",
  "Do 5 jumping jacks to get your blood flowing and boost alertness.",
  "Practice gratitude by thinking of 3 things you're thankful for today.",
  "Tidy up your workspace to create a clearer mental space.",
  "Listen to your favorite song and let yourself enjoy the moment.",
  "Write down one thing you accomplished in your last focus session.",
  "Do some gentle shoulder shrugs to release upper body tension.",
  "Take a mindful sip of tea or coffee and savor the flavor.",
  "Look out the window and observe nature for a few peaceful moments.",
  "Do 5 slow, controlled squats to energize your body.",
  "Practice the 4-7-8 breathing technique: inhale 4, hold 7, exhale 8.",
  "Smile genuinely and notice how it affects your mood instantly.",
  "Gently massage your temples in small circles to ease mental fatigue.",
  "Stand on one foot for 30 seconds to improve balance and focus.",
  "Think of someone you care about and send them positive thoughts.",
  "Do some gentle wrist and finger stretches to prevent strain.",
  "Take a moment to appreciate how far you've come in your goals.",
  "Practice mindful eating with a healthy snack, chewing slowly.",
  "Do 10 gentle toe touches to stretch your back and legs.",
  "Close your eyes and visualize your next successful focus session.",
  "Organize one small area of your space for a sense of accomplishment.",
]

// Store previous suggestions
const storePreviousSuggestion = (suggestion) => {
  try {
    const previous = JSON.parse(localStorage.getItem("previousSuggestions") || "[]")
    previous.push(suggestion)
    if (previous.length > 10) previous.shift()
    localStorage.setItem("previousSuggestions", JSON.stringify(previous))
  } catch (error) {
    console.warn("Could not store previous suggestion:", error)
  }
}

// Get fallback suggestion (avoids duplicates)
const getFallbackSuggestion = () => {
  let previous = []
  try {
    previous = JSON.parse(localStorage.getItem("previousSuggestions") || "[]")
  } catch (error) {
    console.warn("Could not read previous suggestions:", error)
  }

  const available = fallbackTips.filter((tip) => !previous.includes(tip))
  const tipsToUse = available.length > 0 ? available : fallbackTips
  const tip = tipsToUse[Math.floor(Math.random() * tipsToUse.length)]

  storePreviousSuggestion(tip)
  return tip
}

// Get AI-based suggestion
export const getAISuggestion = async () => {
  const OPENAI_API_KEY = getAPIKey()

  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not found, using fallback")
    return getFallbackSuggestion()
  }

  const prompts = [
    "Suggest one short, healthy, and mindful break activity in 1 sentence.",
    "Give me a quick productivity tip for after a focus session in 1 sentence.",
    "Recommend a brief mindfulness exercise I can do right now in 1 sentence.",
    "Share a simple way to recharge my energy during a break in 1 sentence.",
    "Suggest a healthy habit I can practice during my break in 1 sentence.",
    "Give me a quick stress-relief technique in 1 sentence.",
    "Recommend a brief physical activity for my break in 1 sentence.",
    "Share a mindful breathing exercise in 1 sentence.",
  ]

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful productivity and wellness assistant. Provide concise, actionable advice that can be completed in 5 minutes or less. Be encouraging and positive.",
          },
          { role: "user", content: randomPrompt },
        ],
        temperature: 0.9,
        max_tokens: 50,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    )

    const suggestion = res.data.choices[0]?.message?.content?.trim()
    if (suggestion) {
      storePreviousSuggestion(suggestion)
      return suggestion
    } else {
      return getFallbackSuggestion()
    }
  } catch (err) {
    console.error("❌ AI Suggestion Error:", err)

    if (err.response?.status === 401) console.error("Invalid OpenAI API key")
    else if (err.response?.status === 429) console.error("Rate limit exceeded")
    else if (err.code === "ECONNABORTED") console.error("Request timed out")

    return getFallbackSuggestion()
  }
}

// Context-aware suggestion
export const getContextualSuggestion = async () => {
  const hour = new Date().getHours()
  const OPENAI_API_KEY = getAPIKey()

  let contextPrompt = hour < 12
    ? "Suggest a morning break activity to boost energy and focus in 1 sentence."
    : hour < 17
    ? "Recommend an afternoon break activity to maintain productivity in 1 sentence."
    : "Share an evening break activity to help wind down while staying focused in 1 sentence."

  if (!OPENAI_API_KEY) {
    return getFallbackSuggestion()
  }

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a wellness coach who gives time-appropriate break suggestions.",
          },
          { role: "user", content: contextPrompt },
        ],
        temperature: 0.8,
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    )

    const suggestion = res.data.choices[0]?.message?.content?.trim()
    if (suggestion) {
      storePreviousSuggestion(suggestion)
      return suggestion
    } else {
      return getFallbackSuggestion()
    }
  } catch (err) {
    console.error("❌ Contextual Suggestion Error:", err)
    return getFallbackSuggestion()
  }
}

// For dev/testing: Clear stored suggestions
export const clearSuggestionHistory = () => {
  localStorage.removeItem("previousSuggestions")
}
