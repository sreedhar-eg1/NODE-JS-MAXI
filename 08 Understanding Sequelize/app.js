const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");

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

// It basically creates the tables in the database if they don't exist and syncs
// the models with the database. It returns a promise, so we can chain a .then()
// to it to start the server after the database is synced.
sequelize
  .sync()
  .then((result) => {
    // console.log(result)
    app.listen(3000);
  })
  .catch((err) => console.log(err)); // Sync the models with the database
