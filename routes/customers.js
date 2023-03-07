const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require("../models/users");

// Create a new customer in Stripe
router.post("/new/:token", async function (req, res) {
  try {
    // Retrieve the user information from the DB using the user token in params
    const {token} = req.params;
    const user = await User.findOne({token});
    // Return false if the user is already in Stripe => should have a Stripe ID attached to his profile in the DB
    if (user.stripeId.length === 0) return res.json({result: false});
    // Save the customer to Stripe
    const {phone} = req.body;
    const customer = await stripe.customers.create({
      name: user.name,
      email: user.email,
      phone,
      description: `Database ID: ${user._id.valueOf()}` // User ID from mongoDB
    });
    // Stripe will return an ID => update the user collection with that ID
    await User.updateOne({token}, {stripeId: customer.id});
    // Return True is all is valid
    res.json({result: true});
  } catch (error) {
    console.log(error);
  }
});

// Find a customer in Stripe
router.get("/:token", async function (req, res) {
  try {
    const {token} = req.params;
    const user = await User.findOne({token});
    if (!user) return res.json({result: false, error: "No user found"});
    const {stripeId} = user;
    const customer = await stripe.customers.retrieve(stripeId);
    res.json({result: true, customer});
  } catch (error) {
    res.json({result: false, error});
  }
});

module.exports = router;
