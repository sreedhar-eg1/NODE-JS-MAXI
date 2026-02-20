const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Please enter a vaild email")
    // custom vaildation
    .custom((value, { req }) => {
      //   if (value === "test@test.com") {
      //     throw new Error("This email is forbidden");
      //   }

      return true;
    }),
  authController.postSignup,
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:resetToken", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

router.post("/logout", authController.postLogout);

module.exports = router;
