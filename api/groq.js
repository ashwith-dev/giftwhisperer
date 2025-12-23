/* =========================================================
   GiftWhisperer – Groq Serverless Backend
   Pattern adapted from your Express /api/chat logic
   Runs on Vercel (Node 18)
========================================================= */

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  // Same safety check you used in Express
  console.log("GROQ_API_KEY present?", !!apiKey);

  if (!apiKey) {
    return res.status(500).json({
      error: "GROQ_API_KEY is not set on the server",
    });
  }

  // Parse body (same robustness as your Express code)
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { mode, data } = body || {};

  /* ===================== MODE: GIFT ===================== */
  if (mode === "gift") {
    const { gender, amount, about, occasion, relationship } = data || {};

    // This is your equivalent of SYSTEM_PROMPT in Express
    const SYSTEM_PROMPT = `
You are GiftWhisperer, an expert gifting assistant for Indian users.

Rules:
- Be practical, thoughtful, and realistic.
- Suggest items easily available in India.
- Avoid generic answers.
- No explanations, no emojis.
- Output ONLY a numbered list of 15 unique gift ideas.
`;

    // This replaces your "messages" array logic
    const USER_PROMPT = `
Recipient details:
- Gender: ${gender}
- Budget: ₹${amount}
- About the person: ${about}
- Occasion: ${occasion}
- Relationship: ${relationship}

Give 15 gift suggestions within the budget.
`;

    try {
      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: USER_PROMPT },
            ],
            temperature: 0.6,
          }),
        }
      );

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        console.error("Groq API error:", errText);
        return res.status(500).json({
          error: "Groq API error",
          details: errText,
        });
      }

      const response = await groqRes.json();
      const answer =
        response.choices?.[0]?.message?.content ||
        "Sorry, I couldn't think of gifts right now.";

      // Same response-style idea as your Express app
      return res.status(200).json({
        success: true,
        answer,
      });
    } catch (err) {
      console.error("Groq server error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  /* ===================== INVALID MODE ===================== */
  return res.status(400).json({ error: "Invalid mode" });
}
