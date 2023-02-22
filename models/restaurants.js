const mongoose = require("mongoose");

const restaurantSchema = mongoose.Schema({
  name: String,
  address: String,
  email: String,
  phone: Number,
  logo: String,
  pictures: String,
  description: String,
  perks: Array,
  validity: Object,
});

const Restaurant = mongoose.model("restaurants", restaurantSchema);

module.exports = Restaurant;
