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

const setStockLimit = async(req,res) => {
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
    if(existingStock)
      res.status(200).json({ message: "Price Limits Update Successfully" });
    else
      res.status(200).json({ message: "Price Limits Set Successfully" });
  }

  catch (error) {
    return res.status(500).json({ message: "Error fetching user data",error });
  }
}

module.exports = { getStockPrice, setStockLimit };
