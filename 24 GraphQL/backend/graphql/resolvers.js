const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { GraphQLError } = require("graphql");

const User = require("../models/user");
const Post = require("../models/post");

const { clearImage } = require("../utils/removeFile");

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
    posts: async function (parent, { page }, context) {
      if (!context.req.isAuth) {
        throw new GraphQLError("Not Authenticated!", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 401,
            },
          },
        });
      }

      if (!page) page = 1;

      const perPage = 2;
      const totalPosts = await Post.find().countDocuments();
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate("creator");

      return {
        totalPosts,
        posts: posts.map((post) => ({
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        })),
      };
    },
    post: async function (parent, { id }, context) {
      if (!context.req.isAuth) {
        throw new GraphQLError("Not Authenticated!", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 401,
            },
          },
        });
      }

      const post = await Post.findById(id).populate("creator");

      if (!post) {
        throw new GraphQLError("Post not found!", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }

      return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
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
      // console.log(parent, postInput, context);

      if (!context.req.isAuth) {
        throw new GraphQLError("Not Authenticated!", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 401,
            },
          },
        });
      }

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

      const user = await User.findById(context.req.userId);

      if (!user) {
        throw new GraphQLError("Invalid user!", {
          extensions: {
            code: "USER_NOT_FOUND",
            http: {
              status: 401,
            },
          },
        });
      }

      const post = new Post({
        title: postInput.title,
        content: postInput.content,
        imageUrl: postInput.imageUrl,
        creator: user,
      });

      const createdPost = await post.save();
      user.posts.push(createdPost);
      await user.save();

      return {
        ...createdPost._doc,
        _id: createdPost._id.toString(),
        createdAt: createdPost.createdAt.toISOString(),
        updatedAt: createdPost.updatedAt.toISOString(),
      };
    },
    updatePost: async function (parent, { id, postInput }, context) {
      const errors = [];

      if (!context.req.isAuth) {
        throw new GraphQLError("Not Authenticated!", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 401,
            },
          },
        });
      }

      const post = await Post.findById(id).populate("creator");

      if (!post) {
        throw new GraphQLError("Post not found!", {
          extensions: {
            code: "NOT_FOUND",
            http: { status: 404 },
          },
        });
      }

      if (post.creator._id.toString() !== context.req.userId) {
        throw new GraphQLError("Not Authenticated!", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 403,
            },
          },
        });
      }

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
          },
        });
      }

      post.title = postInput.title;
      post.content = postInput.content;

      if (postInput.imageUrl && postInput.imageUrl !== "undefined") {
        post.imageUrl = postInput.imageUrl;
      }

      const updatedPost = await post.save();

      return {
        ...updatedPost._doc,
        _id: updatedPost._id.toString(),
        createdAt: updatedPost.createdAt.toISOString(),
        updatedAt: updatedPost.updatedAt.toISOString(),
      };
    },
    deletePost: async function (parent, { id }, context) {
      if (!context.req.isAuth) {
        throw new GraphQLError("Not Authenticated!", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 401,
            },
          },
        });
      }

      const post = await Post.findById(id);

      if (!post) {
        throw new GraphQLError("Post not found!", {
          extensions: {
            code: "NOT_FOUND",
            http: { status: 404 },
          },
        });
      }

      if (post.creator.toString() !== context.req.userId) {
        throw new GraphQLError("Not Authenticated!", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: {
              status: 403,
            },
          },
        });
      }

      clearImage(post.imageUrl);

      await Post.findByIdAndDelete(id);

      const user = await User.findById(context.req.userId);
      user.posts.pull(id);
      await user.save();

      return true;
    },
  },
};
