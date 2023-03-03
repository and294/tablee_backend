const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/users");

/* -------------------------------------------------------------------------- */
/*         Create / edit a card and inject it to a customer on Stripe         */
/* -------------------------------------------------------------------------- */

router.post("/card/:token", async function (req, res) {
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
});

/* -------------------------------------------------------------------------- */
/*                          Charge amount to customer                         */
/* -------------------------------------------------------------------------- */

// To charge a credit card or other payment source, you create a Charge object. If your API key is in test mode, the supplied payment source (e.g., card) won’t actually be charged, although everything else will occur as if in live mode. (Stripe assumes that the charge would have completed successfully).

router.post("/charge", async function (req, res) {
  const charge = await stripe.charges.create({
    customer,
    receipt_email,
    amount: 2000,
    currency: "eur",
    source: "tok_amex", // card token
    description:
      "My First Test Charge (created for API docs at https://www.stripe.com/docs/api)",
  });
});

module.exports = router;
