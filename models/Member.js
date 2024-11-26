const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  mobile: { type: Number, required: true },
  email: { type: String, required: true },
  occupation: { type: String, required: true },
  createpassword: { type: String, required: true }
});

module.exports = mongoose.model("Member", MemberSchema);
