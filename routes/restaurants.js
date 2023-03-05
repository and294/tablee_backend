var express = require("express");
var router = express.Router();

const {checkBody} = require("../modules/checkBody");
const {generateSlots} = require("../modules/slots");
const uid2 = require("uid2");

const Restaurant = require("../models/restaurants");
const fetch = require("node-fetch");

//* add new Restaurant
router.post("/", (req, res) => {
  const {
    name,
    cuisineTypes,
    email,
    averagePrice,
    phone,
    pictures,
    description,
    perks,
    reviews,
    availabilities
  } = req.body;

  // Adresse à inclure dans le body de la requête
  const address = {
    streetNumber: 66,
    streetName: "avenue d'Ivry",
    postCode: 75013,
    city: "Paris"
  };

  if (!checkBody([name, cuisineTypes, email, averagePrice, phone, description])) {
    return res.json({result: false, error: "Champs manquants ou vides."});
  }

  const newRestaurant = new Restaurant({
    name,
    cuisineTypes,
    email,
    token: uid2(32),
    address,
    averagePrice,
    phone,
    pictures,
    description,
    perks,
    reviews,
    availabilities
  });

  newRestaurant.save().then((resto) => {
    res.json({result: true, restaurants: resto});
  });

});

//. Get all restaurants
router.get("/", async function (req, res) {
  const allRestaurants = await Restaurant.find({});
  res.json({allRestaurants});
});

//. Get all restaurants' coordinates
router.get("/all", async function (req, res) {
  const restaurantArr = [];
  const allRestaurants = await Restaurant.find({});
  for (const restaurant of allRestaurants) {
    const {streetNumber, streetName, postCode} = restaurant.address;
    const {name, cuisineTypes, token, description, averagePrice} = restaurant;
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
      token,
      averagePrice,
      latitude,
      longitude
    };
    restaurantArr.push(coordinates);
  }
  res.json({result: true, allRestaurants: restaurantArr});
});

//. Get restaurants by cuisineTypes or by Token ('^' +search + '$', 'i')
router.get("/:token", function (req, res) {
  Restaurant.findOne({token: req.params.token}) //search by token
  .then((data) => {
    if (data) {
      res.json({result: true, restaurant: data});
    } else {
      res.json({result: false, error: "Pas de résultat."});
    }
  });
});

/* -------------------------------------------------------------------------- */
/*            Route pour ajouter les dispos aux restos déjà en BDD            */
/* -------------------------------------------------------------------------- */

router.put("/:token", async function (req, res) {
  const {token} = req.params;
  const restaurant = await Restaurant.findOne({token});
  const timeSlots = generateSlots(restaurant.name, restaurant.availabilities);
  await Restaurant.findOneAndUpdate({token}, {timeSlots});
  res.json({result: true, message: "Restaurant mis à jour avec succès !"});
});

// Route export :
module.exports = router;
