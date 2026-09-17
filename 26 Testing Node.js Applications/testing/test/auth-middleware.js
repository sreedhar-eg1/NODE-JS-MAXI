const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/is-auth");

// describe from mocha allows us to group multiple test
// Basically it helps us to organize
describe("Auth Middleware", function () {
  it("Should throw an error if no Authorization header is present", function () {
    const req = {
      get: function (headername) {
        return null;
      },
    };

    //   We are binding this because we want chai to call this
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated. No token provided.",
    );
  });

  it("Should throw an error if Authorization header is a single string", function () {
    const req = {
      get: function (headerName) {
        return "sometoken";
      },
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("Should throw an error if the token cannot be verified", function () {
    const req = {
      get: function (headerName) {
        return "Bearer sometoken";
      },
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("Should yeild the userId after decoding the token", function () {
    const req = {
      get: function (headerName) {
        return "Bearer sometoken";
      },
    };

    // This will overwrite verify method of the json web token dependency
    // jwt.verify = function() {
    //     return {
    //         userId: 'some user id'
    //     }
    // }

    // Making use of sinon to override the verify method of jwt
    sinon.stub(jwt, "verify");

    jwt.verify.returns({
      userId: "some user id",
    });

    authMiddleware(req, {}, () => {});

    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "some user id");

    // Making sure that in our middleware, jwt.verify method has been called
    expect(jwt.verify.called).to.be.true;

    // Restore the overridden method to original one
    jwt.verify.restore();
  });
});
