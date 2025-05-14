process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();
const puppeteer = require("puppeteer");
const StockUser = require("../models/alertPrice");

// ✅ Puppeteer fallback to scrape last price from NSE
async function fetchStockPriceWithPuppeteer(symbol) {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    );
    await page.goto(
      `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`,
      {
        waitUntil: "networkidle2",
        timeout: 15000,
      },
    );

    await page.waitForSelector(".securityInfo", { timeout: 10000 });
    const price = await page.evaluate(() => {
      const el = document.querySelector(".lastPrice span");
      return el ? el.textContent.replace(/₹|,/g, "").trim() : null;
    });

    await browser.close();

    if (!price) throw new Error("Could not extract price from NSE page");
    return parseFloat(price);
  } catch (error) {
    console.error("Puppeteer fallback failed:", error.message);
    return null;
  }
}

// ✅ Get live stock price
const getStockPrice = async (req, res) => {
  const stockID = req.params.id;
  if (!stockID) {
    return res.status(400).json({ message: "Stock ID is required" });
  }

  try {
    const details = await nseIndia.getEquityDetails(stockID);
    if (
      details &&
      details.priceInfo &&
      details.priceInfo.lastPrice !== undefined
    ) {
      return res.status(200).json(details);
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.warn(`stock-nse-india failed for ${stockID}: ${error.message}`);

    const fallbackPrice = await fetchStockPriceWithPuppeteer(stockID);
    if (fallbackPrice !== null) {
      return res.status(200).json({
        priceInfo: {
          lastPrice: fallbackPrice,
        },
        source: "puppeteer-fallback",
      });
    }

    res.status(500).json({
      message: "Failed to fetch stock price from NSE",
      error: error.message,
    });
  }
};

// ✅ Set alert price
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
    return res
      .status(500)
      .json({ message: "Error updating user data", error: error.message });
  }
};

// ✅ Get historical data
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
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
};

module.exports = { getStockPrice, setStockLimit, getHistory };
