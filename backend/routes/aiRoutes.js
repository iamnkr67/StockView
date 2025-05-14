const express = require("express");
const router = express.Router();
const axios = require("axios");

const GEMINI_API_KEY = "YOUR_ACTUAL_API_KEY"; // Replace with your actual API key

router.post("/analyze", async (req, res) => {
  const { stockId, lastPrice, currentPrice } = req.body;

  if (!stockId || !lastPrice || !currentPrice) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  prompt = `
  Given the following stock information:
  
  Symbol: ${stockData.info.symbol}
  Company Name: ${stockData.info.companyName}
  Industry: ${stockData.info.industry}
  
  Current Price: ₹${stockData.priceInfo.lastPrice}
  Change: ${stockData.priceInfo.change} (${stockData.priceInfo.pChange}%)
  Previous Close: ₹${stockData.priceInfo.previousClose}
  VWAP: ₹${stockData.priceInfo.vwap}
  52 Week High: ₹${conststockData.priceInfo.weekHighLow.max}
  52 Week Low: ₹${stockData.priceInfo.weekHighLow.min}
  
  Analyze this stock and provide a simple recommendation: Buy, Sell, or Hold. Base your answer only on this data and explain briefly.
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const aiResponse =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";
    res.json({ recommendation: aiResponse });
  } catch (error) {
    console.error(
      "Error calling Gemini API:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to fetch AI recommendation" });
  }
});

module.exports = router;
