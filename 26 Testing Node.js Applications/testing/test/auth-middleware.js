const { expect } = require("chai");

const authMiddleware = require("../middleware/is-auth");

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
