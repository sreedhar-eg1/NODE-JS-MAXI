const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session); // connect session details with mongoDB
const cookieParser = require("cookie-parser"); // cookieParser is required while using csrf-csrf dependency
const flash = require("connect-flash"); // To show flash message with the help of sessions
const multer = require("multer");

const {
  generateCsrfToken,
  doubleCsrfProtection,
} = require("./middleware/csrf");

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

const filestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: filestorage, fileFilter: fileFilter }).single(
  "image",
); // To handle file uploads, dest is the destination folder where the uploaded files will be stored, single means we are uploading a single file and 'image' is the name of the field in the form which will be used to upload the file

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.set("views", "views"); // Specify the views directory

app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload); // To handle file uploads
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
app.use(flash()); // registering flash, so we can use it anywhere across our application

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = generateCsrfToken(req, res); // available in all views with the help of locals field
  next();
});
app.use(doubleCsrfProtection);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }

      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500); // To render a error page
app.use(errorController.get404);

// Middleware with 4 arguments is used to handle errors, whenever we call next(error) in our code,
// this middleware will be executed
app.use((error, req, res, next) => {
  res.redirect("/500");
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("CONNECTED AND LISTENING TO PORT 3000");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
