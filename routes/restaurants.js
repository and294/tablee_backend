var express = require("express");
var router = express.Router();

const { checkBody } = require("../modules/checkBody");

const Restaurant = require("../models/restaurants");
const fetch = require("node-fetch");

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
router.get("/", async function (req, res) {
  const allRestaurants = await Restaurant.find({});
  res.json({ allRestaurants });
});

//. Get all restaurants' coordinates
router.get("/all", async function (req, res) {
  const restaurantArr = [];
  const allRestaurants = await Restaurant.find({});
  for (const restaurant of allRestaurants) {
    const { streetNumber, streetName, postCode } = restaurant.address;
    const { name, cuisineTypes, description, averagePrice } = restaurant;
    const restaurantAddress = `${streetNumber} ${streetName} ${postCode}`;
    const apiResponse = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${restaurantAddress}`
    );
    const apiData = await apiResponse.json();
    const latitude = apiData.features[0].geometry.coordinates[1];
    const longitude = apiData.features[0].geometry.coordinates[0];
    const coordinates = {
      name,
      cuisineTypes,
      description,
      averagePrice,
      latitude,
      longitude,
    };
    restaurantArr.push(coordinates);
  }
  res.json({ result: true, allRestaurants: restaurantArr });
});

//. Get restaurants by cuisineTypes or by Name ('^' +search + '$', 'i')
router.get("/:query", function (req, res) {
  Restaurant.findOne(
    { name: { $regex: new RegExp("^" + req.params.query + "$", "i") } } //search by name
  ).then((data) => {
    if (data) {
      res.json({ result: true, restaurant: data });
    } else {
      Restaurant.find({
        cuisineTypes: { $regex: new RegExp("^" + req.params.query + "$", "i") }, //search by cuisineTypes
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
