const express = require("express");
const router = express.Router();
const { handlePurchase } = require("../controllers/purchaseController");

router.post("/", handlePurchase);

module.exports = router;
