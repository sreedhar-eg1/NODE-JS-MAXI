const { expect } = require("chai");
const sinon = require("sinon");

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
});
