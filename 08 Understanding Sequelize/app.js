const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

const errorController = require("./controllers/errors");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.set("views", "views"); // Specify the views directory

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Adding associations
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// It basically creates the tables in the database if they don't exist and syncs
// the models with the database. It returns a promise, so we can chain a .then()
// to it to start the server after the database is synced.
sequelize
  // .sync({force: true}) // will clear the data in the database, not recommended to use
  .sync()
  .then((_) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Max", email: "test@test.com" });
    }

    return Promise.resolve(user);
  })
  .then((user) => {
    return user.createCart();
  })
  .then((_) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err)); // Sync the models with the database
