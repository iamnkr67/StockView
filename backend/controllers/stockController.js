const axios = require("axios");
const StockUser = require("../models/alertPrice");

const NSE_BASE_URL = "https://www.nseindia.com";

// Setup NSE Axios client
const nseAxios = axios.create({
  baseURL: NSE_BASE_URL,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    Referer: "https://www.nseindia.com",
    Connection: "keep-alive",
  },
  withCredentials: true,
});

// Utility to fetch equity data
async function fetchEquityDetails(symbol) {
  try {
    await nseAxios.get("/"); // Initialize cookies
    const response = await nseAxios.get(`/api/quote-equity?symbol=${symbol}`);
    const priceInfo = response.data?.priceInfo;

    if (!priceInfo || priceInfo.lastPrice === undefined) {
      throw new Error("Invalid stock symbol or missing price info");
    }

    return {
      symbol: response.data.info.symbol,
      lastPrice: priceInfo.lastPrice,
      change: priceInfo.change,
      pChange: priceInfo.pChange,
    };
  } catch (error) {
    console.error(
      `Failed to fetch equity details for ${symbol}:`,
      error.message,
    );
    throw new Error("Unable to fetch stock data");
  }
}

// Utility to fetch historical data
async function fetchEquityHistoricalData(symbol) {
  try {
    await nseAxios.get("/");
    const res = await nseAxios.get(
      `/api/equity-historical-data?symbol=${symbol}`,
    );
    return res.data;
  } catch (error) {
    console.error(
      `Failed to fetch historical data for ${symbol}:`,
      error.message,
    );
    throw new Error("Unable to fetch historical data");
  }
}

// GET: Stock price by symbol
const getStockPrice = async (req, res) => {
  const { id: symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({ message: "Stock ID is required" });
  }

  try {
    const stockData = await fetchEquityDetails(symbol.toUpperCase());
    return res.status(200).json(stockData);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST: Set stock alert limit
const setStockLimit = async (req, res) => {
  const { name, email, stock } = req.body;

  if (!name || !email || !stock || !stock.stockId) {
    return res
      .status(400)
      .json({ message: "Name, email, and stock details are required." });
  }

  try {
    let user = await StockUser.findOne({ email });

    if (!user) {
      user = new StockUser({ name, email, stock: [] });
    }

    const existing = user.stock.find((s) => s.stockId === stock.stockId);
    if (existing) {
      existing.targetPrice = stock.targetPrice;
      existing.stopLoss = stock.stopLoss;
    } else {
      user.stock.push(stock);
    }

    await user.save();
    return res.status(200).json({
      message: existing
        ? "Price limits updated successfully"
        : "Price limits set successfully",
    });
  } catch (error) {
    console.error("Failed to save alert:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET: Fetch alerts by email
const getAlertsByEmail = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const alerts = await StockUser.find({ email });
    return res.status(200).json(alerts);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return res.status(500).json({ message: "Error fetching alerts" });
  }
};

// GET: Historical chart data
const getHistory = async (req, res) => {
  const { symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required" });
  }

  try {
    const raw = await fetchEquityHistoricalData(symbol.toUpperCase());

    const chartData = [];

    raw.forEach((segment) => {
      if (Array.isArray(segment?.data)) {
        segment.data.forEach((d) => {
          chartData.push({
            time: Math.floor(new Date(d.CH_TIMESTAMP).getTime() / 1000),
            open: d.CH_OPENING_PRICE,
            high: d.CH_TRADE_HIGH_PRICE,
            low: d.CH_TRADE_LOW_PRICE,
            close: d.CH_CLOSING_PRICE,
          });
        });
      }
    });

    chartData.sort((a, b) => a.time - b.time);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json(chartData);
  } catch (error) {
    console.error("Historical data error:", error.message);
    return res.status(500).json({ message: "Failed to fetch historical data" });
  }
};

module.exports = {
  getStockPrice,
  setStockLimit,
  getAlertsByEmail,
  getHistory,
};
