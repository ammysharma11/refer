const mongoose = require("mongoose");
const User     = require("../models/User");
const Earning  = require("../models/Earning");

exports.createPurchase = async (req, res) => {
  const io = req.app.get("io");
  const { userId, amount } = req.body;

  console.log("💰 createPurchase:", { userId, amount });

  if (!userId || typeof amount !== "number") {
    return res.status(400).json({ message: "userId & numeric amount required" });
  }
  if (amount <= 1000) {
    return res.status(200).json({ message: "Below threshold—no earnings" });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const profit = amount * 0.20;   // 20 % margin

      const purchaser = await User.findById(userId).lean();
      if (!purchaser) throw new Error(`Purchaser not found: ${userId}`);

      // -------- Level 1 ----------
      if (purchaser.referredBy) {
        const parentId = purchaser.referredBy.toString();
        const share1   = profit * 0.05;          // 5 %

        await Earning.create([{
          userId:         parentId,
          fromUserId:     userId,
          level:          1,
          purchaseAmount: amount,
          earningAmount:  share1
        }], { session });

        io.to(parentId).emit("earningsUpdate", {
          level: 1,
          amount: share1,          // <- send the earning amount
          from:   userId
        });
      }

      // -------- Level 2 ----------
      if (purchaser.referredBy) {
        const parent = await User.findById(purchaser.referredBy).lean();
        if (parent && parent.referredBy) {
          const grandId = parent.referredBy.toString();
          const share2  = profit * 0.01;        // 1 %

          await Earning.create([{
            userId:         grandId,
            fromUserId:     userId,
            level:          2,
            purchaseAmount: amount,
            earningAmount:  share2
          }], { session });

          io.to(grandId).emit("earningsUpdate", {
            level: 2,
            amount: share2,
            from:   userId
          });
        }
      }
    });

    session.endSession();
    return res.status(201).json({ message: "Purchase processed" });
  } catch (err) {
    console.error("‼️ createPurchase error:", err);
    try { await session.abortTransaction(); } catch (_) {}
    session.endSession();
    return res.status(500).json({ message: err.message });
  }
};
