const express = require("express");
const router = express.Router();
const moment = require("moment");
const User = require("../models/users");
const Restaurant = require("../models/restaurants");
const Booking = require("../models/bookings");
const mongoose = require("mongoose");

// Create new booking:

router.post("/new/:token", async (req, res) => {
  let history = [];
  try {
    const {token} = req.params;
    const {guests, date, specialRequests, restaurantToken} = req.body;
    const user = await User.findOne({token});
    const restaurant = await Restaurant.findOne({token: restaurantToken});
    const timeSlot = await restaurant.timeSlots.find(slot => slot.start === date);
    const newBooking = await new Booking({
      booker: user._id.valueOf(),
      guests,
      date,
      specialRequests,
      restaurant: restaurant._id.valueOf(),
      initialData: timeSlot
    });
    await newBooking.save();

    let newTimeSlotArray = [];
    for (const slot of restaurant.timeSlots) {
      if (slot.start !== date) newTimeSlotArray.push(slot);
    }
    await Restaurant.findOneAndUpdate({token: restaurantToken}, {timeSlots: newTimeSlotArray});

    history = user.history;
    history.push(newBooking._id.valueOf());
    await User.findOneAndUpdate({token}, {history: history});

    res.json({result: true, bookingId: newBooking._id.valueOf()});
  } catch (error) {
    console.log(error);
    res.json({result: false});
  }
});

// Delete booking

router.delete("/delete/:token", async (req, res) => {
  let updatedTimeSlots = [];
  let updatedHistory = [];
  try {
    const {token} = req.params;
    const user = await User.findOne({token});
    const {bookingId} = req.body;
    const booking = await Booking.findById(bookingId);
    const restaurantId = booking.restaurant.valueOf();
    const restaurant = await Restaurant.findById(restaurantId);

    for (const slot of restaurant.timeSlots) updatedTimeSlots.push(slot);
    updatedTimeSlots.push(booking.initialData);
    updatedTimeSlots.sort((a, b) => (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : 0));
    await Restaurant.findByIdAndUpdate(restaurantId, {timeSlots: updatedTimeSlots});
    await Booking.findByIdAndDelete(bookingId);

    for (const id of user.history) {
      if (id.valueOf() !== bookingId) updatedHistory.push(id);
    }
    await User.findOneAndUpdate({token}, {history: updatedHistory});

    res.json({result: true});
  } catch (error) {
    console.log(error);
    res.json({result: false});
  }
});

module.exports = router;
