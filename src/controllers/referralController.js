// src/controllers/reportController.js
const mongoose = require("mongoose");
const User     = require("../models/User");
const Earning  = require("../models/Earning");

/*───────────────────────────────────────────────────────────
  GET /api/earnings/report/:id
  • byLevel     → [{ level, total }]
  • byReferrer  → [{ id, user, total }]
───────────────────────────────────────────────────────────*/
async function userReport (req, res) {
  try {
    const uid = new mongoose.Types.ObjectId(req.params.id);

    const byLevel = await Earning.aggregate([
      { $match : { userId: uid } },
      { $group : { _id: "$level", total: { $sum: "$earningAmount" } } },
      { $project: { _id: 0, level: "$_id", total: 1 } }
    ]);

    const byReferrer = await Earning.aggregate([
      { $match : { userId: uid } },
      { $group : { _id: "$fromUserId", total: { $sum: "$earningAmount" } } },
      { $lookup: {
          from         : "users",
          localField   : "_id",
          foreignField : "_id",
          as           : "u"
        }},
      { $unwind : "$u" },
      { $project: { _id: 0, id: "$u._id", user: "$u.name", total: 1 } },
      { $sort   : { total: -1 } }
    ]);

    res.json({ byLevel, byReferrer });
  } catch (err) {
    console.error("userReport error:", err);
    res.status(500).json({ message: "Server error generating report" });
  }
}

/*───────────────────────────────────────────────────────────
  GET /api/referrals/tree/:id
  • returns nested tree object: { id, user, children:[…] }
───────────────────────────────────────────────────────────*/
/* src/controllers/reportController.js */
async function referralTree (req, res) {
  try {
    const rootId = new mongoose.Types.ObjectId(req.params.id);

    const [doc] = await User.aggregate([
      { $match:{ _id: rootId } },
      { $graphLookup:{
          from             :"users",
          startWith        :"$_id",
          connectFromField :"_id",
          connectToField   :"referredBy",
          as               :"flat",
          depthField       :"depth"
        }},
      { $project:{
          _id  :0,
          id   :"$_id",
          user :"$name",
          flat :{
            _id        :1,
            name       :1,
            referredBy :1,
            depth      :1
          }
        }}
    ]);

    if (!doc) return res.status(404).json({ message:"User not found" });

    const map = {};
    // include root
    map[rootId.toString()] = { id: rootId, user: doc.user, children:[] };

    // every descendant
    doc.flat.forEach(n=>{
      map[n._id.toString()] = { id:n._id, user:n.name, children:[] };
    });

    // wire parent→child relations
    doc.flat.forEach(n=>{
      if (n.depth===0) return;                // skip root
      const p = map[n.referredBy.toString()];
      if (p) p.children.push( map[n._id.toString()] );
    });

    res.json( map[rootId.toString()] );
  } catch (err) {
    console.error("referralTree error:", err);
    res.status(500).json({ message:"Server error building tree" });
  }
}

module.exports = { userReport, referralTree };


/*───────────────────────────────────────────────────────────*/
