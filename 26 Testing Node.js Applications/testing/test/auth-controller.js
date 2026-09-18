const { expect } = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");

const AuthController = require("../controllers/auth");

describe("Auth Controller", function () {
  let savedUser;

  before(async function () {
    await mongoose.connect(
      "mongodb+srv://sreedhareg1997_db_user:eT6lQe9C74f65Jpq@node-complete.ra50bsw.mongodb.net/test-messages",
    );

    const user = new User({
      email: "test@test.com",
      password: "tester",
      name: "Test",
      posts: [],
    });
    savedUser = await user.save();
  });

  after(async function () {
    await User.deleteOne({ _id: savedUser._id });
    await mongoose.disconnect();
  });

  afterEach(function () {
    sinon.restore(); // safety net in case a test fails before restoring its stub
  });

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

  it("should send a response with a valid user status for an existing user", async function () {
    this.timeout(5000);

    const req = { userId: savedUser._id.toString() };

    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (status) {
        this.statusCode = status;
        return this;
      },
      json: function (data) {
        this.userStatus = data;
      },
    };

    await AuthController.getUserStatus(req, res, () => {});

    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.have.property("status", "I am new!");
  });
});
