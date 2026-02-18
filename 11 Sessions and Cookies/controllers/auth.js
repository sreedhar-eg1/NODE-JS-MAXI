const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req
  //   .get("Cookie")
  //   .split(";")
  //   .at(-1)
  //   .trim()
  //   .split("=")
  //   .at(-1);

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
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
        cart: user.cart,
      };
      req.session.isLoggedIn = true; // setting session value using session property
      // res.setHeader("Set-Cookie", "loggedIn=true");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // deleting the session
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
