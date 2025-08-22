import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import { OpenAI } from 'openai';

config();

const app = express();
const port = process.env.PORT; // Railway injects this
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Proper CORS setup (optional: tighten this later)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());

app.post('/ask', async (req, res) => {
  try {
    const { prompt, mode = "exam", persona = "eb", system } = req.body;

    const systemPrompt = system || `You are ${persona}, a friendly and clear South African study coach. Use plain language, warmth, examples, and structure to help learners understand. Format your answers clearly.`;

    const modeInstruction =
      mode === "tldr"
        ? `Summarise clearly in 3–5 bullet points. Avoid too much detail. Use a friendly tone.`
        : `Explain using paragraph structure, numbered steps if helpful, and give short relatable examples. Use clear headers and recap the key idea at the end.`;

    const fullPrompt = `${modeInstruction}\n\n${prompt}`;

    const chat = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: fullPrompt }
      ],
      model: "gpt-4o"
    });

    res.json({ answer: chat.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ Must listen on 0.0.0.0 for Railway or Fly.io
app.listen(port, "0.0.0.0", () => {
  console.log(`empowermint GPT proxy running on port ${port}`);
});
