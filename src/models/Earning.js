const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  level: {
    type: Number,
    enum: [1, 2], // Only Level 1 or Level 2 earnings are valid
    required: true
  },
  purchaseAmount: {
    type: Number,
    required: true
  },
  earningAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Earning", earningSchema);
