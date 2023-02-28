const mongoose = require("mongoose");

const creditCardSchema = mongoose.Schema({
  name: String,
  number: Number,
  exp: Date, // format: MM/YY
  cvc: Number,
});

const bookingSchema = mongoose.Schema({
  booker: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  guests: Number,
  date: Date,
  specialRequests: String,
  creditCard: creditCardSchema,
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "restaurants" },
  isVisible: Boolean,
});

const Booking = mongoose.model("bookings", bookingSchema);

module.exports = Booking;
