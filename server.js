import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_KEY;

app.post("/chat", async (req, res) => {
  try {
    const userInput = req.body.prompt;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un assistant francophone utile." },
          { role: "user", content: userInput }
        ]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur du serveur" });
  }
});

app.listen(3000, () => console.log("✅ Serveur Render actif sur le port 3000"));
