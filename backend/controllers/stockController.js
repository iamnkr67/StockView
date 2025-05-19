process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require("axios");
const cheerio = require("cheerio");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const StockUser = require("../models/alertPrice");

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

client.defaults.headers.common["User-Agent"] =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
client.defaults.headers.common["Accept"] =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";
client.defaults.headers.common["Accept-Language"] = "en-US,en;q=0.9";

const getStockPrice = async (req, res) => {
  const stockID = req.params.id.toUpperCase();
  if (!stockID) {
    return res.status(400).json({ message: "Stock ID is required" });
  }

  try {
    await client.get("https://www.nseindia.com");

    const response = await client.get(
      `https://www.nseindia.com/get-quotes/equity?symbol=${stockID}`,
    );

    const html = response.data;
    const $ = cheerio.load(html);

    const scriptTags = $("script");
    let jsonData = null;

    scriptTags.each((_, el) => {
      const text = $(el).html();
      if (text.includes("window.__PRELOADED_STATE__")) {
        const match = text.match(/window\.__PRELOADED_STATE__\s*=\s*({.*});/);
        if (match) {
          jsonData = JSON.parse(match[1]);
        }
      }
    });

    if (!jsonData || !jsonData.quotes || !jsonData.quotes[stockID]) {
      return res
        .status(404)
        .json({ error: `Stock data not found for ${stockID}` });
    }

    const stock = jsonData.quotes[stockID];
    const { priceInfo, metadata } = stock;

    return res.status(200).json({
      symbol: stockID,
      lastPrice: priceInfo.lastPrice,
      previousClose: priceInfo.previousClose,
      change: priceInfo.change,
      pChange: priceInfo.pChange,
      companyName: metadata.companyName,
      industry: metadata.industry,
    });
  } catch (err) {
    console.error("NSE scraping error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch stock data", details: err.message });
  }
};

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
      res.status(200).json({ message: "Price Limits Update Successfully" });
    else res.status(200).json({ message: "Price Limits Set Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error saving user data", error: error.message });
  }
};

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

const getHistory = async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setMonth(today.getMonth() - 6); // 6 months history

    const formattedTo = today.toISOString().split("T")[0];
    const formattedFrom = pastDate.toISOString().split("T")[0];

    const url = `https://www.nseindia.com/api/historical/cm/equity?symbol=${symbol}&series=[%22EQ%22]&from=${formattedFrom}&to=${formattedTo}&csv=false`;

    await client.get("https://www.nseindia.com"); // preload cookies
    const response = await client.get(url, {
      headers: {
        Referer: `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`,
      },
    });

    const data = response.data.data;
    const allData = data.map((d) => ({
      time: Math.floor(new Date(d.CH_TIMESTAMP).getTime() / 1000),
      open: d.CH_OPENING_PRICE,
      high: d.CH_TRADE_HIGH_PRICE,
      low: d.CH_TRADE_LOW_PRICE,
      close: d.CH_CLOSING_PRICE,
    }));

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
