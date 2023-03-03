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
    from: `"L'équipe Tablée" <${process.env.NODEMAILER_EMAIL}>`, // sender address
    to: recipient, // list of receivers
    subject: "Merci d'avoir utilisé Tablée !", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  res.json({ result: true, info });
});

module.exports = router;
