// api/groq.js
// Vercel Serverless Function – Groq Proxy
// Handles GiftWhisperer AI logic securely


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { mode, data } = body || {};

  try {
    /* =========================================================
       GIFT RECOMMENDATION MODE
    ========================================================= */
    if (mode === "gift") {
      if (!data) {
        return res.status(400).json({ error: "Missing gift data" });
      }

      const prompt = `
You are GiftWhisperer, a premium gift recommendation assistant.

Recipient details:
- Gender: ${data.gender}
- Budget: ₹${data.amount}
- About: ${data.about}
- Occasion: ${data.occasion}
- Relationship: ${data.relationship}

Instructions:
- Suggest 15 unique gift ideas.
- Gifts should fit within the budget.
- Prefer items easily available in India.
- Avoid generic answers like "gift cards".
- Format clearly as a numbered list.
`;

      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apiKey,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are an expert gifting assistant. Be practical and thoughtful.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.6,
          }),
        }
      );

      if (!groqRes.ok) {
        const txt = await groqRes.text().catch(() => "");
        return res.status(groqRes.status).json({
          error: "Groq API error",
          details: txt,
        });
      }

      const groqData = await groqRes.json();
      const answer =
        groqData.choices?.[0]?.message?.content?.trim() || "";

      return res.status(200).json({
        success: true,
        mode: "gift",
        answer,
      });
    }

    /* =========================================================
       INVALID MODE
    ========================================================= */
    return res.status(400).json({ error: "Invalid mode" });
  } catch (err) {
    console.error("Groq backend error:", err);
    return res.status(500).json({
      error: "Groq backend error",
      details: String(err.message || err),
    });
  }
}
