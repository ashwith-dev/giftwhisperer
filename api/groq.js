export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    console.log("OPENAI KEY PRESENT?", !!apiKey);

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY missing" });
    }

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { mode, data } = body || {};

    if (mode !== "gift" || !data) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const prompt = `
You are GiftWhisperer, an expert gifting assistant.

User details:
- Gender: ${data.gender}
- Budget: ₹${data.amount}
- About: ${data.about}
- Occasion: ${data.occasion}
- Relationship: ${data.relationship}

TASK:
Suggest exactly 15 thoughtful gift ideas.

FORMAT:
1. Gift Name – short reason
   Amazon Product link

RULES:
- Give with the product links
- Respect budget
- Use simple search terms
- Avoid duplicates
- Avoid generic items like 'Gift Card' or 'Cash'
- Analyse user details for personalized suggestions
- Analyse in general world and give the best suggestions
- Give the links of the products
- The links should be working , redirect to the product page
- Use Amazon India links (amazon.in)
- The product should be given with the company or the brand name with the model
- Example:https://www.amazon.in/Noise-Wireless-Metallic-Playtime-Instacharge/dp/B0D4QLT8WG/ref=sr_1_1_sspa?crid=2Z1N927ORWHF&dib=eyJ2IjoiMSJ9.mqI-Vl-4XVzBY9LjpBeeZtJ6GdInbsJS6XtEaZrt4yxp3MH7shpvjq_opILbZ2Vue4quO1ygeRqLWZRDOxlCS6FzNS9IOoKrM5OcmHQcM894VPB6h7qT43Xm5FuZmU34XEY0riuaZ9J1WzjQcOMcG3tXjhuMr1nvuK54mdlQwWHlTcOhxtxqnji3szQndxIAW-pgVNG73Fke1ldtccG92DhV_eegf2MQwpNc0YK8vPI.wXc6iP5WU8sAloy_4VXQWaQ5PvlR3CfhX9KY2fZ1ods&dib_tag=se&keywords=noise%2Btws&nsdOptOutParam=true&qid=1766513791&sprefix=noise%2Btw%2Caps%2C486&sr=8-1-spons&aref=lCfhhtpfQ3&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1
`;

    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful gifting assistant." },
            { role: "user", content: prompt }
          ],
          temperature: 0.6
        })
      }
    );

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      console.error("OpenAI error:", txt);
      return res.status(500).json({ error: "OpenAI API error", details: txt });
    }

    const json = await openaiRes.json();
    const answer = json.choices?.[0]?.message?.content || "";

    res.status(200).json({ success: true, answer });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server crash", details: err.message });
  }
}
