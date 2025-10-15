import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "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";

app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un assistant amical parlant français." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ reply: "❌ Réponse vide du modèle." });
    }

  } catch (err) {
    console.error("Erreur API:", err);
    res.status(500).json({ reply: "⚠️ Erreur interne du serveur." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Serveur en ligne et prêt !");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));

