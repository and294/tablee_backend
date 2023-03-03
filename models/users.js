const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  firstname: String,
  email: String,
  password: String,
  token: String,
  picture: String,
  studentCard: String,
  bio: String,
  stripeId: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "restaurants" }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "bookings" }],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
