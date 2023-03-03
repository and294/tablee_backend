const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/users");
const Restaurant = require("../models/restaurants");
const moment = require("moment");

/* -------------------------------------------------------------------------- */
/*         Create / edit a card and inject it to a customer on Stripe         */
/* -------------------------------------------------------------------------- */

router.post("/card/:token", async function (req, res) {
  try {
    const { token } = req.params;
    const { name, number, exp_month, exp_year, cvc } = req.body;
    const card = { name, number, exp_month, exp_year, cvc };
    const cardToken = await stripe.tokens.create({ card });
    const tokenId = cardToken.id;
    const cardId = cardToken.card.id;
    const user = await User.findOne({ token });
    const { stripeId } = user;
    const customer = await stripe.customers.update(stripeId, {
      source: tokenId,
    });
    res.json({ result: true, tokenId, cardId, customer });
  } catch (error) {
    res.json(error);
  }
});

/* -------------------------------------------------------------------------- */
/*                          Charge amount to customer                         */
/* -------------------------------------------------------------------------- */

// To charge a credit card or other payment source, you create a Charge object. If your API key is in test mode, the supplied payment source (e.g., card) won’t actually be charged, although everything else will occur as if in live mode. (Stripe assumes that the charge would have completed successfully).

router.post("/charge/:token", async function (req, res) {
  try {
    const { token } = req.params;
    const { meal } = req.body; // Petit Déjeuner / Déjeuner / Afternoon Tea / Dîner
    const { isoDate, restaurantToken } = req.body;
    let { chargeableAmount } = req.body; // montant x 100 (ie. 2000 === 20.00 €)
    const date = moment(isoDate).locale("fr").format("LL"); // En ISO ( 2023-02-11T12:00:00+0000 )
    parseInt((chargeableAmount *= 100));
    const restaurant = await Restaurant.findOne({ token: restaurantToken });
    const user = await User.findOne({ token });
    const customer = await stripe.customers.retrieve(user.stripeId);
    const charge = await stripe.charges.create({
      customer: user.stripeId,
      receipt_email: customer.email,
      amount: chargeableAmount,
      currency: "eur",
      description: `${meal} du ${date} chez ${restaurant.name}`,
    });

    res.json({ result: true, receipt_url: charge.receipt_url });
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
