import axios from "axios";

export const getAISuggestion = async () => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a productivity assistant.",
          },
          {
            role: "user",
            content:
              "Suggest one short, healthy, and mindful break activity in 1 sentence.",
          },
        ],
        temperature: 0.7,
        max_tokens: 30,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("AI Suggestion Error:", err);
    return "Take a deep breath and relax! 🌿";
  }
};
