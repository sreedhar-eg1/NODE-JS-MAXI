const { expect } = require("chai");
const sinon = require("sinon");

const User = require("../models/user");

const AuthController = require("../controllers/auth");

describe("Auth Controller - Login", function () {
  it("Should throws an error with code 500 if accessing the database fails", function () {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    expect(AuthController.login);

    User.findOne.restore();
  });
});
