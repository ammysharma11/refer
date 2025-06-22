// src/controllers/userController.js
const mongoose = require("mongoose");
const User = require("../models/User");

/* ---------------------------------------------------------------------------
 * GET /api/users
 * Return EVERY user with the extra fields the front-end needs
 *---------------------------------------------------------------------------*/
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name referredBy referrals")
      .lean();
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

/* ---------------------------------------------------------------------------
 * GET /api/users/:id
 * Handy utility if you want a single user (used by tree/report endpoints)
 *---------------------------------------------------------------------------*/
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name referredBy referrals")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------------------------------------------
 * POST /api/users
 * body = { name, email, referredBy? }
 * - no duplicate emails
 * - parent must exist and have < 8 direct refs
 * - pushes new user into parent's `referrals` array
 *---------------------------------------------------------------------------*/
exports.createUser = async (req, res) => {
  try {
    const { name, email, referredBy } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "name and email are required" });
    }

    // 1) Duplicate-email guard
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2) Validate parent (if any)
    let parent = null;
    if (referredBy) {
      if (!mongoose.isValidObjectId(referredBy)) {
        return res.status(400).json({ message: "Invalid referrer ID" });
      }

      parent = await User.findById(referredBy);
      if (!parent) {
        return res.status(400).json({ message: "Referrer not found" });
      }
      if (parent.referrals.length >= 8) {
        return res
          .status(400)
          .json({ message: "Referrer already has 8 direct referrals" });
      }
    }

    // 3) Create the user
    const newUser = await User.create({
      name,
      email,
      referredBy: parent ? parent._id : null,
      referrals: []
    });

    // 4) If there is a parent, push child ID into their referrals
    if (parent) {
      parent.referrals.push(newUser._id);
      await parent.save();
    }

    res.status(201).json(newUser);
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: "Server error creating user" });
  }
};
