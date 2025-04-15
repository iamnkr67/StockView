const express = require("express");
const {getStockPrice, setStockLimit, getHistory} = require("../controllers/stockController");
const router = express.Router();

router.get("/:id", getStockPrice);
router.post("/alert", setStockLimit);
router.get("/graph/:symbol", getHistory);

module.exports = router;
