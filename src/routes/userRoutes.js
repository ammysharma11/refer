const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userController");
console.log("Route /api/users loaded")
router.post("/", createUser);
// GET all users (for admin/demo/testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users); // Returns an array of all users (with _id, name, email, etc.)
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
