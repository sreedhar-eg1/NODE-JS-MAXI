const path = require("path")

const express = require("express");

// create a router using express.Router()
const router = express.Router();

router.get("/add-product", (req, res, next) => {
  console.log("add product middleware")
  res.sendFile(path.join(__dirname, "../", "views", "add-product.html"))
});

// with use, it will match all HTTP methods (GET, POST, etc.)
// app.use("/product", (req, res, next) => {
//   // To getform data
//   console.log(req.body) // undefined without body-parser or express.json() middleware
//   res.redirect("/");
// })

// Filtering out for only post requests
router.post("/add-product", (req, res, next) => {
  // To getform data
  console.log(req.body) // undefined without body-parser or express.json() middleware
  res.redirect("/");
})


module.exports = router