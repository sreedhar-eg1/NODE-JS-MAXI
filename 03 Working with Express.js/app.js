const express = require("express");
const bodyParser = require("body-parser");

// Create an Express application
const app = express();

// Middleware to parse URL-encoded bodies (from HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

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

app.use("/add-product", (req, res, next) => {
  console.log("add product middleware")
  res.send(
    '<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>',
  );
});

// with use, it will match all HTTP methods (GET, POST, etc.)
app.use("/product", (req, res, next) => {
  // To getform data
  console.log(req.body) // undefined without body-parser or express.json() middleware
  res.redirect("/");
})

app.use("/", (req, res, next) => {
  console.log("In another middleware");

  // send() ends the request-response cycle
  res.send("<h1>Hello from Express.js!</h1>");
});

// Will create an HTTP server and listen on port 3000
app.listen(3000);
