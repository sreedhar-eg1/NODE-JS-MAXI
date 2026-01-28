const path = require("path")

const express = require("express");

const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// Create an Express application
const app = express();

// Middleware to parse URL-encoded bodies (from HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

// Use all the routes as a middleware
// app.use(adminRoutes);
// app.use(shopRoutes);

// Mounting the admin routes at /admin
app.use("/admin", adminRoutes);
// Mounting the shop routes at /
app.use(shopRoutes);

// To handle 404 errors (page not found)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "page-not-found.html"));
})

// Will create an HTTP server and listen on port 3000
app.listen(3000);
