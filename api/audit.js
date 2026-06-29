export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
        }),
      }
    );

    const data = await response.json();

    // Gemini error passthrough
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "Gemini API error" });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
