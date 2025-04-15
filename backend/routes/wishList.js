const express = require("express");
const router = express.Router();
const { wishlists } = require("../data/wishlistData");


router.post("/", (req, res) => {
  const { email, stock } = req.body;
  if (!email || !stock) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  wishlists[email] = wishlists[email] || [];
  const exists = wishlists[email].some(
    (item) => item.stockId === stock.stockId,
  );
  if (!exists) {
    wishlists[email].push(stock);
  }

  res.json({ message: "Added to wishlist" });
});

router.get("/:email", (req, res) => {
  const { email } = req.params;
  res.json(wishlists[email] || []);
});

router.delete("/:email/:stockId", (req, res) => {
  const { email, stockId } = req.params;
  if (wishlists[email]) {
    wishlists[email] = wishlists[email].filter(
      (item) => item.stockId !== stockId,
    );
  }
  res.json({ message: "Removed from wishlist" });
});

module.exports = router;
