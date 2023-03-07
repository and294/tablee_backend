const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Restaurant = require("../models/restaurants");
const Booking = require("../models/bookings");

// Create new booking:
router.post("/new/:token", async (req, res) => {
  let history = [];
  let newTimeSlotArray = [];
  try {
    // Retrieve the user's data from the token in parameters
    const {token} = req.params;
    const user = await User.findOne({token});
    // Retrieve the booking's data from the body
    const {guests, date, specialRequests, restaurantToken} = req.body;
    // Retrieve the restaurant's data from the DB
    const restaurant = await Restaurant.findOne({token: restaurantToken});
    // Find the selected timeslot from the timeSlot key
    const timeSlot = await restaurant.timeSlots.find(slot => slot.start === date);
    // Create and push the new booking with all the correct information to the Bookings collection
    const newBooking = await new Booking({
      booker: user._id.valueOf(),
      guests,
      date,
      specialRequests,
      restaurant: restaurant._id.valueOf(),
      initialData: timeSlot
    });
    await newBooking.save();
    // Update the revised timeslots of the restaurant, taking into account the one just allocated
    for (const slot of restaurant.timeSlots) if (slot.start !== date) newTimeSlotArray.push(slot);
    await Restaurant.findOneAndUpdate({token: restaurantToken}, {timeSlots: newTimeSlotArray});
    // Update the User's history by adding the booking's id
    history = user.history;
    history.push(newBooking._id.valueOf());
    await User.findOneAndUpdate({token}, {history: history});
    // Result True if successful
    res.json({result: true, message: "Réservation créée avec succès 🍽", bookingId: newBooking._id.valueOf()});
  } catch (error) {
    console.log(error);
  }
});

// Delete booking
router.delete("/delete/:token", async (req, res) => {
  let updatedTimeSlots = [];
  let updatedHistory = [];
  try {
    // Retrieve the user data using the token
    const {token} = req.params;
    const user = await User.findOne({token});
    // Retrieve the booking data from the body using the token
    const {bookingId} = req.body;
    const booking = await Booking.findById(bookingId);
    // Retrieve the restaurant ID attached to the booking from the DB
    const restaurantId = booking.restaurant.valueOf();
    // Find the restaurant data
    const restaurant = await Restaurant.findById(restaurantId);
    // Push in an empty array all the available timeslots of the restaurant
    for (const slot of restaurant.timeSlots) updatedTimeSlots.push(slot);
    updatedTimeSlots.push(booking.initialData);
    updatedTimeSlots.sort((a, b) => (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : 0));
    // Update the restaurant's timeSlot key with the new array
    await Restaurant.findByIdAndUpdate(restaurantId, {timeSlots: updatedTimeSlots});
    //Delete the booking from the Bookings collection
    await Booking.findByIdAndDelete(bookingId);
    // Update the User's history by removing the booking
    for (const id of user.history) if (id.valueOf() !== bookingId) updatedHistory.push(id);
    await User.findOneAndUpdate({token}, {history: updatedHistory});
    // Result True if successful
    res.json({result: true, message: "Réservation supprimée 😢"});
  } catch (error) {
    console.log(error);
  }
});

// Read all user's bookings
router.get("/all/:token", async (req, res) => {
  try {
    // Retrieve the user data using the token
    const {token} = req.params;
    const user = await User.findOne({token});
    // Using the user's id, find and populate the correct bookings from the DB
    const bookings = await Booking.find({booker: user._id}).populate(["booker", "restaurant"]);
    // Return False if no booking is found
    if (bookings.length === 0) return res.json({result: false, error: "Pas encore de réservation 😉"});
    // Return True + Booking list if successful
    res.json({result: true, bookings});
  } catch (error) {
    console.log(error);
  }
});

// Read a specific booking
router.get("/:bookingId", async (req, res) => {
  try {
    // Retrieve the booking data using the token
    const {bookingId} = req.params;
    const booking = await Booking.findById(bookingId).populate(["booker", "restaurant"]);
    // Return false if no booking is found
    if (!booking) return res.json({result: false});
    // Return True + Booking if successful
    res.json({result: true, booking});
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
