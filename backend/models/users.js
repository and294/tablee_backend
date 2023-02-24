const mongoose = require("mongoose");

const creditCardSchema = mongoose.Schema({
  name: String,
  number: Number,
  expirationDate: Date, // format: MM/YY
  cvc: Number,
});

const userSchema = mongoose.Schema({
  username: String,
  firstname: String,
  email: String,
  password: String,
  token: String,
  picture: String,
  studentCard: String,
  bio: String,
  creditCard: creditCardSchema,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "restaurants" }],
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "bookings" }],
});

const User = mongoose.model("users", userSchema);

module.exports = User;

// testt
