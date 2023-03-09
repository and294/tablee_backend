var express = require("express");
var router = express.Router();

const User = require("../models/users");
const Restaurant = require("../models/restaurants");

const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const moment = require("moment");

const {checkBody} = require("../modules/checkBody");
const {passwordRegex, emailRegex} = require("../modules/regex");

/* -------------------------------------------------------------------------- */
/*                                 Upload file                                */
/* -------------------------------------------------------------------------- */

router.post("/upload", async (req, res) => {
  const {photoFromFront} = req.files;
  const photoPath = `/tmp/${uniqid()}.jpg`;
  const resultMove = await photoFromFront.mv(photoPath);
  const resultCloudinary = await cloudinary.uploader.upload(photoPath);

  fs.unlinkSync(photoPath);

  if (!resultMove) {
    res.json({result: true, url: resultCloudinary.secure_url});
  } else {
    res.json({result: false, error: resultMove});
  }
});

/* -------------------------------------------------------------------------- */
/*                                   Signup                                   */
/* -------------------------------------------------------------------------- */

router.post("/signup", function (req, res) {
  const {username, firstname, lastname, email, password, studentCard} = req.body;

  // Check if any of the fields is empty or null
  if (!checkBody([username, firstname, lastname, email, password])) {
    return res.json({
      result: false,
      errorSrc: "field",
      error: "Champs manquants ou vides."
    });
  }

  // Check if the password is strong enough -> 8 characters, 1 lowercase, 1 uppercase, 1 numeric, 1 special
  if (!passwordRegex.test(password)) {
    return res.json({
      result: false,
      errorSrc: "password",
      error: `Le mot de passe doit contenir au moins:
      - 8 caractères,
      - 1 lettre minuscule,
      - 1 lettre majuscule,
      - 1 chiffre,
      - 1 caractère spécial`
    });
  }

  // Block certain domains -> gmail, yahoo, hotmail, aol, msn, icloud, wanadoo, orange, free, live, outlook etc...
  if (emailRegex.test(email)) {
    return res.json({
      result: false,
      errorSrc: "email",
      error: "Adresse email étudiant non valide."
    });
  }

  // Check if the student card has been saved
  if (!checkBody([studentCard])) {
    res.json({
      result: false,
      errorSrc: "studentCard",
      error: "Carte étudiant manquante."
    });
    return;
  }

  // Check if the user is already in the database:
  User.findOne({username}).then((data) => {
    if (data) {
      res.json({
        result: false,
        errorSrc: "username",
        error: "Utilisateur(trice) déjà inscrit(e)."
      });
    } else {
      // If all the tests have been validated, hash the password:
      const hash = bcrypt.hashSync(password, 10);

      // Save the info in the database:
      const newUser = new User({
        username,
        firstname,
        lastname,
        email,
        password: hash,
        token: uid2(32),
        picture: "",
        studentCard,
        bio: "",
        stripeId: "",
        likes: [],
        history: []
      });

      newUser.save().then(() => {
        res.json({result: true, token: newUser.token});
      });
    }
  });
});

/* -------------------------------------------------------------------------- */
/*                                   Signin                                   */
/* -------------------------------------------------------------------------- */

router.post("/signin", function (req, res) {
  const {username, password} = req.body;

  // Check if the fields are empty or null:
  if (!checkBody([username, password])) {
    res.json({
      result: false,
      errorSrc: "field",
      error: "Champs manquants ou vides."
    });
    return;
  }

  // Check if the user is already in the database:
  User.findOne({username}).then((data) => {
    if (!data) {
      res.json({
        result: false,
        errorSrc: "username",
        error: "Utilisateur(trice) non reconnu(e)."
      });
    } else {
      if (bcrypt.compareSync(password, data.password)) {
        res.json({result: true, token: data.token});
      } else {
        res.json({
          result: false,
          errorSrc: "password",
          error: "Mot de passe erroné."
        });
      }
    }
  });
});

/* -------------------------------------------------------------------------- */
/*                          Get a single user's infos                         */
/* -------------------------------------------------------------------------- */

router.get("/:token", function (req, res) {
  const {token} = req.params;

  User.findOne({token})
  .populate("likes")
  .then((data) => {
    res.json({result: true, user: data});
  });
});

/* -------------------------------------------------------------------------- */
/*                            Get all users' infos                            */
/* -------------------------------------------------------------------------- */

router.get("/", function (req, res) {
  User.find({}).then((data) => res.json({allUsers: data}));
});

/* -------------------------------------------------------------------------- */
/*                             Change users' infos                            */
/* -------------------------------------------------------------------------- */

router.put("/:token", async (req, res) => {
  const token = req.params;
  let update = req.body;
  let passwordCheck = true;
  let hash = null;
  if (req.body.password) {
    // Check if the password is strong enough -> 8 characters, 1 lowercase, 1 uppercase, 1 numeric, 1 special
    if (!passwordRegex.test(req.body.password)) {
      passwordCheck = false;
    } else {
      hash = bcrypt.hashSync(req.body.password, 10);
      update = {password: hash};
    }
  }
  if (!passwordCheck) {
    res.json({
      result: false,
      errorSrc: "password",
      error: `Le mot de passe doit contenir au moins:
    - 8 caractères,
    - 1 lettre minuscule,
    - 1 lettre majuscule,
    - 1 chiffre,
    - 1 caractère spécial`
    });
  } else {
    await User.findOneAndUpdate(token, update);
    res.json({result: true});
  }
});

/* -------------------------------------------------------------------------- */
/*                        Add a restaurant to favorites                       */
/* -------------------------------------------------------------------------- */

router.post("/like/:token", async (req, res) => {
  const {token} = req.params;
  const user = await User.findOne({token});
  const {restaurantToken} = req.body;
  const restaurantResponse = await Restaurant.findOne({token: restaurantToken});
  //User already liked the restaurant
  if (user.likes.includes(restaurantResponse._id.valueOf())) {
    user.likes.splice(user.likes.indexOf(restaurantResponse._id.valueOf()), 1);
    await user.save();
    res.json({result: false});
  } else {
    user.likes.push(restaurantResponse._id);
    await user.save();
    res.json({result: true});
  } //Add restaurant ID to likes

});

router.get("/:token/:restaurantToken", async (req, res) => {
  const {token, restaurantToken} = req.params;
  const user = await User.findOne({token});
  const restaurantResponse = await Restaurant.findOne({token: restaurantToken});
  const restaurantId = restaurantResponse._id;
  //User already liked the restaurant
  if (user.likes.find((restaurant) => restaurant._id.valueOf() === restaurantId.valueOf())) {
    res.json({result: true});
  } else {
    res.json({result: false});
  } //Add restaurant ID to likes

});


// Route export :
module.exports = router;
