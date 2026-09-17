const { expect } = require("chai");

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
});
