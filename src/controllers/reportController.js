// src/controllers/reportController.js
const mongoose = require("mongoose");
const Earning  = require("../models/Earning");

/*──────────────────────────────────────────────────────────
  GET /api/earnings/report/:id
  • byLevel     → [{ level, total }]
  • byReferrer  → [{ id, user, total }]
──────────────────────────────────────────────────────────*/
async function userReport(req, res) {
  try {
    const uid = new mongoose.Types.ObjectId(req.params.id);

    const byLevel = await Earning.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$level", total: { $sum: "$earningAmount" } } },
      { $project: { _id: 0, level: "$_id", total: 1 } }
    ]);

    const byReferrer = await Earning.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: "$fromUserId", total: { $sum: "$earningAmount" } } },
      { $lookup: {
          from         : "users",
          localField   : "_id",
          foreignField : "_id",
          as           : "u"
        }},
      { $unwind: "$u" },
      { $project: { _id: 0, id: "$u._id", user: "$u.name", total: 1 } },
      { $sort: { total: -1 } }
    ]);

    res.json({ byLevel, byReferrer });
  } catch (err) {
    console.error("userReport error:", err);
    res.status(500).json({ message: "Server error generating report" });
  }
}

module.exports = { userReport };
