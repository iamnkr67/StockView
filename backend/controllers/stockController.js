process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();

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

module.exports = { getStockPrice };
