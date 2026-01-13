const express = require("express");

// Create an Express application
const app = express();

// To add new middleware, use app.use()
app.use((req, res, next) => {
  console.log("In one middleware");
  next(); // Call next() to pass control to the next middleware
});

// Adding route to the middleware chain
app.use("/home", (req, res, next) => {
  console.log("In the /home middleware");
  res.send("<h1>Welcome to the Home Page!</h1>");
});

app.use("/", (req, res, next) => {
  console.log("In another middleware");

  // send() ends the request-response cycle
  res.send("<h1>Hello from Express.js!</h1>");
});

// Will create an HTTP server and listen on port 3000
app.listen(3000);
