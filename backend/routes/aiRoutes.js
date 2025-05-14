const express = require("express");
const axios = require("axios");
const router = express.Router();

// POST endpoint for AI recommendation
router.post("/recommendation", async (req, res) => {
  const { stockId, lastPrice, currentPrice } = req.body;

  // Ensure that the required data is provided
  if (!stockId || !lastPrice || !currentPrice) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Create a prompt for the AI model based on the provided stock data
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
    // Send request to Gemini API for AI-generated content
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
    );

    // Extract the decision from the response
    const decision = geminiRes.data.candidates[0].content.parts[0].text.trim();
    res.json({ decision }); // Return AI decision (Buy, Sell, or Hold)
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Gemini AI error" });
  }
});

module.exports = router;
