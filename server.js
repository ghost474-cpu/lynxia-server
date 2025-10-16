import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ إعدادات أساسية
app.use(cors());
app.use(express.json());

// 🔒 المفتاح يؤخذ فقط من متغير البيئة (لا تكتبه مباشرة هنا!)
const API_KEY = process.env.OPENROUTER_KEY;

// 🔹 نقطة المحادثة (نهاية API الخاصة بالذكاء الاصطناعي)
app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    return res.status(400).json({ reply: "⚠️ Aucun texte reçu." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://ton-site-ou-projet.com", // اختياري
        "X-Title": "LynxIA Chatbot", // اسم مشروعك (اختياري)
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // نموذج مجاني وخفيف
        messages: [
          { role: "system", content: "Tu es un assistant amical qui parle français." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (data.choices?.[0]?.message?.content) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      console.error("Réponse inattendue:", data);
      res.status(500).json({ reply: "❌ Le modèle n'a pas renvoyé de texte." });
    }

  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ reply: "⚠️ Erreur interne du serveur ou problème de connexion." });
  }
});

// 🔹 نقطة اختبار السيرفر
app.get("/", (req, res) => {
  res.send("✅ Serveur LynxIA est en ligne et opérationnel !");
});

// 🔹 تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
