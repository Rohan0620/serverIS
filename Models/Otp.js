const mongoose = require("mongoose");

const otpsSchema = new mongoose.Schema({
  otp: {
    type: String,
  },
  expiration_time: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
    allowNull: true,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
const otps = mongoose.model("otps", otpsSchema);
module.exports = otps;
