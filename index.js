import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Explicitly pass the API key from Railway’s environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/ask", async (req, res) => {
  try {
    const { question, mode = "tldr", systemPrompt } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const response = await openai.chat.completions.create({
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
    });

    const answer = response.choices[0]?.message?.content?.trim() || "";
    res.status(200).json({ ok: true, answer, mode });
  } catch (error) {
    console.error("GPT Error:", error);
    res.status(500).json({ error: "GPT failed", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`empowermint GPT proxy listening on port ${port}`);
});
