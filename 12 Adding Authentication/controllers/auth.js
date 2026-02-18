const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  req.isLoggedIn = true;

  User.findById("698eee62787efa5e60deeff8")
    .then((user) => {
      req.session.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      };
      req.session.isLoggedIn = true; // setting session value using session property
      // res.setHeader("Set-Cookie", "loggedIn=true");
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      }); // to make sure session is saved to the database, after that execute the next line
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/signup");
      }

      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      const newUser = new User({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then(res.redirect("/login"))
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // deleting the session
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
