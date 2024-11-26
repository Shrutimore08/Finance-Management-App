const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  mobile: { type: Number, required: true },
  email: { type: String, required: true },
  amt: { type: Number, required: true },
  type: { type: String, required: true },
  msg: { type: String },
  code: { type: String, required: true }
});

module.exports = mongoose.model("Request", RequestSchema);
