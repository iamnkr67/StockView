const express = require("express");
const {getStockPrice} = require("../controllers/stockController");
const router = express.Router();

router.get("/:id", getStockPrice);

module.exports = router;
