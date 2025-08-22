import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

app.post("/ask", async (req, res) => {
  const { question, mode = "tldr", systemPrompt } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              systemPrompt ||
              (mode === "exam"
                ? "You are a strict but supportive exam coach for high school learners in South Africa. Structure answers step-by-step, show workings, and include marking‑style cues."
                : "You are a concise explainer. Give the clearest possible answer in plain English with short bullets and examples."),
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "";

    res.status(200).json({ ok: true, answer, mode });
  } catch (err) {
    console.error("GPT error:", err.message);
    res.status(500).json({ error: "Failed to call OpenAI", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`empowermint GPT proxy running on port ${port}`);
});
