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

var productRouter = require("./routes/products");
app.use("/products", productRouter);

var paymentRouter = require("./routes/cards");
app.use("/cards", paymentRouter);

var customerRouter = require("./routes/customers");
app.use("/customers", customerRouter);

var mailsRouter = require("./routes/mails"); // Route test
app.use("/mails", mailsRouter);

var bookingsRouter = require("./routes/bookings");
app.use("/bookings", bookingsRouter);

module.exports = app;
