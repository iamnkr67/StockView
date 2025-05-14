const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/recommendation", async (req, res) => {
  const { stockId, lastPrice, currentPrice } = req.body;

  const prompt = `
You are a trading assistant. 
If the stock price increases from the last to current, it might be good to 'Hold' or 'Buy'.
If it decreases, it might be good to 'Sell'.
Decide based on this data:
Stock: ${stockId}
Last Price: ₹${lastPrice}
Current Price: ₹${currentPrice}

Respond with one word only: Buy, Sell, or Hold.
`;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
    );

    const decision = geminiRes.data.candidates[0].content.parts[0].text.trim();
    res.json({ decision });
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Gemini AI error" });
  }
});

module.exports = router;
