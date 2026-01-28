const path = require("path");

const express = require("express");

const router = express.Router();

// To add new middleware, use app.use()
router.use((req, res, next) => {
  console.log("In one middleware");
  next(); // Call next() to pass control to the next middleware
});

// Adding route to the middleware chain
router.get("/home", (req, res, next) => {
  console.log("In the /home middleware");
  res.send("<h1>Welcome to the Home Page!</h1>");
});

router.get("/", (req, res, next) => {
  console.log("In another middleware");

  // send() ends the request-response cycle
  // res.send("<h1>Hello from Express.js!</h1>");

  //   To send a HTML file as a response
  console.log(__dirname); // logs the directory of the current module
  res.sendFile(path.join(__dirname, "../", "views", "shop.html"));
});

module.exports = router;
