const { expect } = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");

const AuthController = require("../controllers/auth");

describe("Auth Controller - Login", function () {
  it("should throw an error with code 500 if accessing the database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: { email: "test@test.com", password: "test" },
    };

    AuthController.login(req, {}, (error) => {
      User.findOne.restore();
      try {
        expect(error).to.be.an("error");
        expect(error).to.have.property("statusCode", 500);
        done();
      } catch (assertionError) {
        done(assertionError);
      }
    }).catch(done); // catch any rejection from login itself
  });

  it("should send a response with a valid user status for an existing user", function (done) {
    mongoose
      .connect(
        "mongodb+srv://sreedhareg1997_db_user:eT6lQe9C74f65Jpq@node-complete.ra50bsw.mongodb.net/test-messages",
      )
      .then(() => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
        });

        return user.save();
      })
      .catch((err) => console.log(err));
  });
});
