const bcrypt = require("bcryptjs");
const validator = require("validator");
const { GraphQLError } = require("graphql");

const User = require("../models/user");

module.exports = {
  Query: {
    hello: () => "Hello world!",
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
  },
};
