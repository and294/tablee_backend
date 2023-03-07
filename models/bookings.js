const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  booker: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
  guests: Number,
  date: String,
  specialRequests: String,
  restaurant: {type: mongoose.Schema.Types.ObjectId, ref: "restaurants"},
  initialData: Object,
  paid: Boolean
});

const Booking = mongoose.model("bookings", bookingSchema);

module.exports = Booking;
