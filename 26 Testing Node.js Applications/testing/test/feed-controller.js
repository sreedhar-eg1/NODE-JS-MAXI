const { expect } = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const Post = require("../models/post");

const FeedController = require("../controllers/feed");

describe("Feed Controller", function () {
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

  beforeEach(function () {});

  afterEach(function () {
    sinon.restore();
  });

  after(async function () {
    await User.deleteOne({ _id: savedUser._id });
    await mongoose.disconnect();
  });

  it("should add a created posts to the posts of the creator", async function () {
    const req = {
      body: {
        title: "Post Title",
        content: "A Post Conetent",
      },
      file: {
        path: "somepath",
      },
      userId: savedUser._id.toString(),
    };

    const res = {
      statusCode: 500,
      post: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.post = data;
      },
    };

    const savedUserAfterPostCreation = await FeedController.createPost(
      req,
      res,
      () => {},
    );

    expect(savedUserAfterPostCreation).to.have.property("posts");
    expect(savedUserAfterPostCreation.posts).to.have.length(1);
  });
});
