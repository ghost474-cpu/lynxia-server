import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ✅ إعدادات أساسية
app.use(cors());
app.use(express.json());

// ⚠️ لا تكرر import cors مرة ثانية!

// 🔑 مفتاح API — الأفضل وضعه في متغير بيئة على Render
const API_KEY = "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";

// 🔹 نقطة المحادثة
app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ reply: "⚠️ Aucune question reçue." });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          { role: "system", content: "Tu es un assistant amical parlant français." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    // 🔍 التحقق من الرد
    if (data.choices && data.choices[0]?.message?.content) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      console.error("Réponse inattendue:", data);
      res.status(500).json({ reply: "❌ Le modèle n'a pas renvoyé de texte." });
    }

  } catch (err) {
    console.error("Erreur API:", err);
    res.status(500).json({ reply: "⚠️ Erreur interne du serveur ou de la connexion." });
  }
});

// 🔹 اختبار السيرفر
app.get("/", (req, res) => {
  res.send("✅ Serveur LynxIA en ligne et opérationnel !");
});

// 🔹 Démarrage
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));




