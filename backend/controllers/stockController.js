process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();
const StockUser = require("../models/alertPrice");

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
      return res.status(404).json({ message: "Stock details not found" });
    }
  } catch (error) {
    console.error("Error fetching stock price: ", error);
    res.status(500).json({ message: "Error fetching stock price" });
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
    return res.status(500).json({ message: "Error fetching user data", error });
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
  const symbol = req.params.symbol;

  try {
    const rawResult = await nseIndia.getEquityHistoricalData(symbol);

    const allData = [];

    // Loop over each historical segment and extract data
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
    // Sort the data by time in ascending order
    allData.sort((a, b) => a.time - b.time);
    // Send the data as a JSON response
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.json(allData);
  } catch (error) {
    console.error("Error fetching historical data:", error.message);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
};

module.exports = { getStockPrice, setStockLimit, getHistory, getAlertsByEmail };
