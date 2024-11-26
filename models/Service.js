const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  imgUrl: { type: String },
  detail: { type: [String], required: true }
});

module.exports = mongoose.model("Service", ServiceSchema);
