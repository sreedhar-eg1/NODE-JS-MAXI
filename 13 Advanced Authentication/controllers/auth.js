const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error"),
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }

      // compare user entered password with the encrypted password, will return boolean
      return bcrypt
        .compare(password, user.password)
        .then((domatch) => {
          if (!domatch) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
          }

          req.session.user = {
            _id: user._id.toString(),
            email: user.email,
          };
          req.session.isLoggedIn = true;

          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      console.log(userDoc);
      if (userDoc) {
        req.flash(
          "error",
          "E-mail exists already. Please pick a different one.",
        );
        return res.redirect("/signup");
      }

      return bcrypt
        .hash(password, 12)
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
    })
    .catch((err) => console.log(err));
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error"),
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buf) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buf.toString("hex");
    console.log(`${buf.length} bytes of random data: ${buf.toString("hex")}`);

    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then(() => {
        console.log("Reset password mail sent.")
        res.redirect(`/reset/${token}`)
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postLogout = (req, res, next) => {
  // deleting the session
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
