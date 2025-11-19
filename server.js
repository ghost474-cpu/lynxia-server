import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_KEY;

app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    return res.status(400).json({ reply: "⚠️ Aucun texte reçu." });
  }

  // تفعيل الـ Streaming عبر SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://ghost474-cpu.github.io/LynxIA/",
        "X-Title": "LynxIA Chatbot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-30b-a3b:free",
        stream: true,
        messages: [
          { role: "system", content: "Tu es un assistant amical qui parle français." },
          { role: "user", content: prompt }
        ]
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.replace("data: ", "").trim();

        if (data === "[DONE]") {
          res.write("event: end\ndata: END\n\n");
          res.end();
          return;
        }

        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.delta?.content;

          if (text) {
            // إرسال النص بالتدفق
            res.write(`data: ${text}\n\n`);
          }
        } catch (err) {
          // تجاهل الـ chunks التي ليست JSON
        }
      }
    }

  } catch (error) {
    console.error("Erreur API:", error);
    res.write("data: [ERREUR SERVEUR]\n\n");
    res.end();
  }
});

app.get("/", (req, res) => {
  res.send("✅ Serveur LynxIA en Streaming est opérationnel !");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
