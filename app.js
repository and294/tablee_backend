//. Dotenv
require("dotenv").config();

//. Boilerplate
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//. MongoDB
require("./models/connection");

//. File upload
const fileUpload = require("express-fileupload");
app.use(fileUpload());

//. Cors
const cors = require("cors");
app.use(cors());

//. Routes
var indexRouter = require("./routes/index");
app.use("/", indexRouter);
var usersRouter = require("./routes/users");
app.use("/users", usersRouter);
var restaurantsRouter = require("./routes/restaurants");
app.use("/restaurants", restaurantsRouter);

module.exports = app;
