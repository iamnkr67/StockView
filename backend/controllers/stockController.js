process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require("axios");
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const StockUser = require("../models/alertPrice");

// Cookie jar and Axios wrapper setup
const jar = new tough.CookieJar();
const client = wrapper(
  axios.create({
    baseURL: "https://www.nseindia.com",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.nseindia.com/",
      Origin: "https://www.nseindia.com",
      Connection: "keep-alive",
    },
    jar,
    withCredentials: true,
  }),
);

// In-memory cache to reduce repeated calls
const cache = new Map();

// Fetch initial cookies
const initializeCookies = async () => {
  try {
    await client.get("/");
  } catch (error) {
    console.error("Failed to initialize NSE cookies:", error.message);
  }
};

// Get stock price from NSE
const getStockPrice = async (req, res) => {
  const stockID = req.params.id;
  if (!stockID)
    return res.status(400).json({ message: "Stock ID is required" });

  try {
    const now = Date.now();
    const cached = cache.get(stockID);
    if (cached && now - cached.timestamp < 30000) {
      return res.status(200).json(cached.data);
    }

    await initializeCookies();

    const response = await client.get(`/api/quote-equity?symbol=${stockID}`);
    const data = response.data;

    if (data?.priceInfo?.lastPrice !== undefined) {
      cache.set(stockID, { data, timestamp: now });
      return res.status(200).json(data);
    } else {
      return res.status(404).json({ message: "Stock details not found" });
    }
  } catch (error) {
    console.error("NSE Fetch Error:", error?.response?.data || error.message);
    return res.status(500).json({ message: "Failed to fetch stock price" });
  }
};

// Set price limit alerts
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
    res.status(200).json({
      message: existingStock
        ? "Price Limits Updated Successfully"
        : "Price Limits Set Successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving price alert", error });
  }
};

// Get user alerts by email
const getAlertsByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const alerts = await StockUser.find({ email });
    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error.message);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

// Get historical data using stock-nse-india as fallback
const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();

const getHistory = async (req, res) => {
  const symbol = req.params.symbol;
  try {
    const rawResult = await nseIndia.getEquityHistoricalData(symbol);
    const allData = [];

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
    res.status(500).json({ message: "Failed to fetch historical data" });
  }
};

module.exports = {
  getStockPrice,
  setStockLimit,
  getAlertsByEmail,
  getHistory,
};
