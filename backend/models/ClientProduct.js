// models/Product.js
const mongoose = require("mongoose");

const clientproductSchema = new mongoose.Schema({
  names: { type: String, required: true },
  id: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  cooperativeName: { type: String, required: true },
  location: { type: String, required: true },
  productType: { type: String, required: true },
  plantTime: { type: String, required: true },
  harvestTime: { type: String, required: true },
  priceSoldAt: { type: Number, required: true },
  needLogistic: { type: Boolean, default: false },
});

module.exports = mongoose.model("ClientProduct", clientproductSchema);