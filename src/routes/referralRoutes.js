const router = require("express").Router();   // <-- use Express router
const { userReport, referralTree } = require("../controllers/reportController");

router.get("/earnings/report/:id", userReport);
router.get("/referrals/tree/:id",  referralTree);

module.exports = router;
