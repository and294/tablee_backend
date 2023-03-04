var express = require("express");
var router = express.Router();
const nodemailer = require("nodemailer");

router.post("/confirm_payment", async function (req, res) {
  const { recipient } = req.body;
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
      type: "login", // default
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Tablée" <${process.env.NODEMAILER_EMAIL}>`, // sender address
    to: recipient, // list of receivers
    subject: "Votre reçu de paiement", // Subject line
    html: "coucou",
  });

  res.json({ result: true, info });
});

module.exports = router;
