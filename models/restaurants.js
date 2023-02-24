const mongoose = require("mongoose");

const restaurantSchema = mongoose.Schema({
  name: String,
  cuisineTypes: String,
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
