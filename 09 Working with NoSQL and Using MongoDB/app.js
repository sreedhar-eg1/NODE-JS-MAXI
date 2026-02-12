const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const { mongoConnect } = require("./util/database");

const User = require("./models/user")

const errorController = require("./controllers/errors");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.set("views", "views"); // Specify the views directory

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById('698d933fdf730c84ed7937bd')
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  console.log("LISTENING TO 3000");
  app.listen(3000);
});
