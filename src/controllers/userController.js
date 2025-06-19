const User = require("../models/User");

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, referredBy } = req.body;

    // 1. Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered." });

    // 2. If referredBy is provided, verify the parent exists and has < 8 referrals
    let parentUser = null;
    if (referredBy) {
      parentUser = await User.findById(referredBy);
      if (!parentUser) {
        return res.status(400).json({ message: "Invalid referrer ID." });
      }

      if (parentUser.referrals.length >= 8) {
        return res.status(400).json({ message: "Referral limit (8) exceeded for this user." });
      }
    }

    // 3. Create the new user
    const newUser = await User.create({
      name,
      email,
      referredBy: parentUser ? parentUser._id : null,
      referrals: []
    });

    // 4. If referredBy exists, update parent user's referrals
    if (parentUser) {
      parentUser.referrals.push(newUser._id);
      await parentUser.save();
    }

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Error in createUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};
