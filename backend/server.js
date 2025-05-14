const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const stockRoutes = require("./routes/stockRoutes");
const wishlistRoutes = require("./routes/wishList");
const aiRoutes = require("./routes/aiRoutes");

const { schedulePriceCheck } = require("./controllers/priceChecker");
// Start the stock price checker
schedulePriceCheck();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

app.use("/api/user", userRoutes);
app.use("/stock", stockRoutes);
app.use("/stock/wishlist", wishlistRoutes);
app.use("/ai/stock-recommendation", aiRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
});
