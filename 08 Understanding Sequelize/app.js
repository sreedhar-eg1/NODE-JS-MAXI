const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/errors");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.set("views", "views"); // Specify the views directory

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
