const express = require("express");
const {getStockPrice, setStockLimit} = require("../controllers/stockController");
const router = express.Router();

router.get("/:id", getStockPrice);
router.post("/alert", setStockLimit);

module.exports = router;
