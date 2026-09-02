const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { GraphQLError } = require("graphql");

const User = require("../models/user");
const Post = require("../models/post");

module.exports = {
  Query: {
    login: async function (parent, { email, password }, context) {
      const user = await User.findOne({ email });

      if (!user) {
        throw new GraphQLError("User not found!", {
          extensions: {
            code: "USER_NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      const isEqual = await bcrypt.compare(password, user.password);

      if (!isEqual) {
        throw new GraphQLError("Password is incorrect!", {
          extensions: {
            code: "INVALID_CREDENTIALS",
            http: {
              status: 401,
            },
          },
        });
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        "mySecretKey",
        { expiresIn: "1h" },
      );

      return { token, userId: user._id.toString() };
    },
  },
  Mutation: {
    // The signature changes to (parent, args, context)
    createUser: async function (parent, { userInput }, context) {
      const errors = [];

      if (!validator.isEmail(userInput.email)) {
        errors.push({ message: "E-Mail is invalid." });
      }

      if (
        validator.isEmpty(userInput.password) ||
        !validator.isLength(userInput.password, { min: 5 })
      ) {
        errors.push({ message: "Password is too short." });
      }

      if (errors.length) {
        throw new GraphQLError("Invalid input!", {
          extensions: {
            code: "BAD_USER_INPUT",
            data: errors,
          },
        });
      }

      const existingUser = await User.findOne({ email: userInput.email });

      if (existingUser) {
        throw new GraphQLError("User exists already!");
      }

      const hashedPassword = await bcrypt.hash(userInput.password, 12);

      const user = new User({
        email: userInput.email,
        name: userInput.name,
        password: hashedPassword,
      });

      const createdUser = await user.save();

      return { ...createdUser._doc, _id: createdUser._id.toString() };
    },
    createPost: async function (parent, { postInput }, context) {
      console.log(parent, postInput, context);
      const errors = [];

      if (
        validator.isEmpty(postInput.title) ||
        !validator.isLength(postInput.title, { min: 5 })
      ) {
        errors.push({ message: "Title is invalid." });
      }

      if (
        validator.isEmpty(postInput.content) ||
        !validator.isLength(postInput.content, { min: 5 })
      ) {
        errors.push({ message: "Content is invalid." });
      }

      if (errors.length) {
        throw new GraphQLError("Invalid input!", {
          extensions: {
            code: "BAD_USER_INPUT",
            data: errors,
            http: {
              status: 422,
            },
          },
        });
      }

      const post = new Post({
        title: postInput.title,
        content: postInput.content,
        imageUrl: postInput.imageUrl,
      });

      const createdPost = await post.save();

      return {
        ...createdPost._doc,
        _id: createdPost._id.toString(),
        createdAt: createdPost.createdAt.toISOString(),
        updatedAt: createdPost.updatedAt.toISOString(),
      };
    },
  },
};
