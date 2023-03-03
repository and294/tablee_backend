const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/users");

/* -------------------------------------------------------------------------- */
/*                                  Customers                                 */
/* -------------------------------------------------------------------------- */

/* ---------------------------- Create a customer --------------------------- */

router.post("/:token", async function (req, res) {
  try {
    const { token } = req.params; // to communicate with MongoDB from frontend
    const { name, email, phone, payment_method } = req.body; // basic information
    const { line1, city, postal_code, country } = req.body; // address
    const address = { line1, city, postal_code, country };
    const user = await User.findOne({ token });
    if (!user)
      return res.json({
        result: false,
        error: "No user found with this token",
      });
    const databaseId = user._id.valueOf(); // stringified version of the object ID
    const customer = await stripe.customers.create({
      name,
      email,
      phone,
      payment_method,
      address,
      description: databaseId, // User ID from mongoDB
    });
    await User.updateOne({ token }, { stripeId: customer.id });
    res.json({ result: true, customer });
  } catch (error) {
    res.json({ result: false, error });
  }
});

/* --------------------------- Retrieve a customer -------------------------- */

router.get("/:token", async function (req, res) {
  try {
    const { token } = req.params;
    const user = await User.findOne({ token });
    if (!user)
      return res.json({
        result: false,
        error: "No user found with this token",
      });
    const { stripeId } = user;
    const customer = await stripe.customers.retrieve(stripeId);
    res.json({ result: true, customer });
  } catch (error) {
    res.json({ result: false, error });
  }
});

module.exports = router;
