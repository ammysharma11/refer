const mongoose = require("mongoose");
const { Schema } = mongoose;

/*
 * One document per payout to a user
 */
const earningSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref : "User",
    required: true            // receiver
  },
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref : "User",
    required: true            // purchaser
  },
  level: {
    type: Number,             // 1 or 2
    required: true
  },
  purchaseAmount: {
    type: Number,             // full spend
    required: true
  },
  earningAmount: {
    type: Number,             // slice paid to userId
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Earning", earningSchema);
