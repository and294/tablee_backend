const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  firstname: String,
  email: String,
  password: String,
  picture: String,
  bio: String,
  studentCard: String,
  creditCard: Number,
  token: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
