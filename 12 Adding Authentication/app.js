const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session); // connect session details with mongoDB
const cookieParser = require("cookie-parser"); // cookieParser is required while using csrf-csrf dependency
const flash = require('connect-flash') // To show flash message with the help of sessions

const { generateCsrfToken } = require("./middleware/csrf");

const User = require("./models/user");

const errorController = require("./controllers/errors");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const MONGODB_URI =
  "mongodb+srv://sreedhareg1997_db_user:eT6lQe9C74f65Jpq@node-complete.ra50bsw.mongodb.net/Shop";

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.set("views", "views"); // Specify the views directory

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  // registering session
  session({
    secret: "Node Complete",
    resave: false, // will not save seesion details on each request
    saveUninitialized: false,
    store: store, // To add mongodb store with sessions
  }),
);
app.use(flash()) // registering flash, so we can use it anywhere across our application

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = generateCsrfToken(req, res); // available in all views with the help of locals field
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("CONNECTED AND LISTENING TO PORT 3000");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
