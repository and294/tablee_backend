var express = require("express");
var router = express.Router();

const { checkBody } = require("../modules/checkBody");

const Restaurant = require("../models/restaurants");

//* add new Restaurant
router.post("/", (req, res) => {
  const {
    name,
    cuisineTypes,
    email,
    address,
    averagePrice,
    phone,
    pictures,
    description,
    perks,
    reviews,
    availabilities,
  } = req.body;
  if (
    !checkBody([name, cuisineTypes, email, averagePrice, phone, description])
  ) {
    res.json({ result: false, error: "Champs manquants ou vides." });
    return;
  } else {
    const newRestaurant = new Restaurant({
      name,
      cuisineTypes,
      email,
      address: {
        streetNumber: 3,
        streetName: "rue Royale",
        postCode: 75008,
        city: "Paris",
      },
      averagePrice,
      phone,
      pictures,
      description,
      perks,
      reviews,
      availabilities,
    });
    newRestaurant.save().then((resto) => {
      res.json({ result: true, restaurants: resto });
    });
  }
});

//. Get all restaurants
router.get("/", function (req, res) {
  Restaurant.find({}).then((data) => res.json({ allRestaurants: data }));
});

//. Get restaurants by cuisineTypes or by Name
router.get("/:query", function (req, res) {
  Restaurant.findOne(
    { name: { $regex: new RegExp(req.params.query, "i") } } //search by name
  ).then((data) => {
    if (data) {
      res.json({ result: true, restaurant: data });
    } else {
      Restaurant.find({
        cuisineTypes: { $regex: new RegExp(req.params.query, "i") }, //search by cuisineTypes
      }).then((data) => {
        if (data.length > 0) {
          res.json({ result: true, restaurant: data });
        } else {
          res.json({ result: false, error: "pas de resultat" });
        }
      });
    }
  });
});

// Route export:
module.exports = router;
