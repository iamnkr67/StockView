const axios = require("axios");
const StockUser = require("../models/alertPrice");

const NSE_BASE_URL = "https://www.nseindia.com";

// Common Axios instance with browser-like headers for NSE requests
const nseAxios = axios.create({
  baseURL: NSE_BASE_URL,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    Origin: "https://www.nseindia.com",
    Referer: "https://www.nseindia.com",
    Connection: "keep-alive",
  },
});

// Helper to fetch stock quote details
async function fetchEquityDetails(symbol) {
  try {
    // First, we need to get cookies by hitting NSE homepage (some NSE endpoints require this)
    await nseAxios.get("/");

    // Now fetch equity quote
    const response = await nseAxios.get(`/get-quotes/equity?symbol=${symbol}`);
    const data = response.data;

    // Parse and return relevant details (adjust this according to actual response)
    if (data && data.priceInfo && data.priceInfo.lastPrice !== undefined) {
      return data;
    } else {
      throw new Error("Price info not found");
    }
  } catch (err) {
    throw err;
  }
}

// Helper to fetch historical data
async function fetchEquityHistoricalData(symbol) {
  try {
    await nseAxios.get("/"); // refresh cookies

    // NSE historical data API endpoint
    const response = await nseAxios.get(
      `/api/equity-historical-data?symbol=${symbol}`,
    );

    // Adjust if response shape is different
    return response.data;
  } catch (err) {
    throw err;
  }
}

// Controller: Get Stock Price
const getStockPrice = async (req, res) => {
  const stockID = req.params.id;
  if (!stockID) {
    return res.status(400).json({ message: "Stock ID is required" });
  }
  try {
    const details = await fetchEquityDetails(stockID);

    res.status(200).json(details);
  } catch (error) {
    console.error("Error fetching stock price: ", error.message);
    res.status(500).json({ message: "Error fetching stock price" });
  }
};

// Controller: Set Stock Limit Alerts
const setStockLimit = async (req, res) => {
  const { name, email, stock } = req.body;
  if (!name || !email || !stock) {
    return res.status(400).json({ message: "All fields are required!" });
  }
  try {
    let user = await StockUser.findOne({ email });
    if (!user) {
      user = new StockUser({ name, email, stock: [] });
    }
    const existingStock = user.stock.find((s) => s.stockId === stock.stockId);
    if (existingStock) {
      existingStock.targetPrice = stock.targetPrice;
      existingStock.stopLoss = stock.stopLoss;
    } else {
      user.stock.push(stock);
    }
    await user.save();
    if (existingStock)
      res.status(200).json({ message: "Price Limits Updated Successfully" });
    else res.status(200).json({ message: "Price Limits Set Successfully" });
  } catch (error) {
    console.error("Error saving user stock alert:", error);
    res.status(500).json({ message: "Error fetching user data", error });
  }
};

// Controller: Get Alerts By Email
const getAlertsByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const alerts = await StockUser.find({ email });
    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching alerts: ", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

// Controller: Get Historical Data
const getHistory = async (req, res) => {
  const symbol = req.params.symbol;
  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required" });
  }
  try {
    const rawResult = await fetchEquityHistoricalData(symbol);

    const allData = [];

    // NSE historical data format varies, adjust accordingly
    rawResult.forEach((segment) => {
      if (segment.data && Array.isArray(segment.data)) {
        segment.data.forEach((d) => {
          allData.push({
            time: Math.floor(new Date(d.CH_TIMESTAMP).getTime() / 1000),
            open: d.CH_OPENING_PRICE,
            high: d.CH_TRADE_HIGH_PRICE,
            low: d.CH_TRADE_LOW_PRICE,
            close: d.CH_CLOSING_PRICE,
          });
        });
      }
    });

    allData.sort((a, b) => a.time - b.time);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(allData);
  } catch (error) {
    console.error("Error fetching historical data:", error.message);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
};

module.exports = {
  getStockPrice,
  setStockLimit,
  getHistory,
  getAlertsByEmail,
};
