const User = require("../models/User");
const Earning = require("../models/Earning");

exports.handlePurchase = async (req, res) => {
  try {
    const { buyerId, purchaseAmount } = req.body;

    // 1. Validate threshold
    if (purchaseAmount < 1000) {
      return res.status(400).json({ message: "Purchase must be at least ₹1000" });
    }

    // 2. Find buyer
    const buyer = await User.findById(buyerId);
    if (!buyer || !buyer.isActive) {
      return res.status(404).json({ message: "Invalid or inactive buyer." });
    }

    const io = req.io; // from middleware

    // 3. Distribute 5% to Level 1 (direct referrer)
    if (buyer.referredBy) {
      const level1 = await User.findById(buyer.referredBy);
      const earning1 = +(purchaseAmount * 0.05).toFixed(2);

      await Earning.create({
        userId: level1._id,
        fromUserId: buyer._id,
        level: 1,
        purchaseAmount,
        earningAmount: earning1
      });

      // 🔔 Notify Level 1
      io.to(level1._id.toString()).emit("earningsUpdate", {
        userId: level1._id,
        amount: earning1,
        from: buyer.name,
        level: 1
      });

      // 4. Distribute 1% to Level 2 (referrer of referrer)
      if (level1.referredBy) {
        const level2 = await User.findById(level1.referredBy);
        const earning2 = +(purchaseAmount * 0.01).toFixed(2);

        await Earning.create({
          userId: level2._id,
          fromUserId: buyer._id,
          level: 2,
          purchaseAmount,
          earningAmount: earning2
        });

        // 🔔 Notify Level 2
        io.to(level2._id.toString()).emit("earningsUpdate", {
          userId: level2._id,
          amount: earning2,
          from: buyer.name,
          level: 2
        });
      }
    }

    res.status(200).json({ message: "Purchase processed. Earnings distributed." });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
