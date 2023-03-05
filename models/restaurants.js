const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  streetNumber: Number,
  streetName: String,
  postCode: Number,
  city: String,
});

const menuItemsSchema = mongoose.Schema({
  name: String,
  price: Number,
  description: String,
});

const reviewsSchema = mongoose.Schema({
  writer: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  description: String,
  upVotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  downVotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

const restaurantSchema = mongoose.Schema({
  name: String,
  cuisineTypes: String,
  email: String,
  token: String,
  address: addressSchema,
  averagePrice: Number,
  menuItems: [menuItemsSchema],
  phone: Number,
  photos: [String],
  description: String,
  perks: [String],
  reviews: [reviewsSchema],
  availabilities: [String],
  timeSlots: [Object],
});

const Restaurant = mongoose.model("restaurants", restaurantSchema);

module.exports = Restaurant;
