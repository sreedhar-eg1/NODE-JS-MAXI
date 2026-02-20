const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a vaild email"),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters.",
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin,
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a vaild email")
      // custom vaildation
      .custom((value, { req }) => {
        // if (value === "abc@abc.com") {
        //   throw new Error("This email is forbidden");
        // }

        // return true;

        // -----------------------------------------------------------------
        // Async validator
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail exists already. Please pick a different one.",
            );
          }
        });
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters.", // default error message
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }

      return true;
    }),
  ],
  authController.postSignup,
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:resetToken", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

router.post("/logout", authController.postLogout);

module.exports = router;
