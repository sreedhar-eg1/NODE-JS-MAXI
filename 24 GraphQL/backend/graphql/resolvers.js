const bcrypt = require("bcryptjs");

const User = require("../models/user");

module.exports = {
  Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    // The signature changes to (parent, args, context)
    createUser: async function (parent, { userInput }, context) {
      console.log("createUser resolver HIT", userInput);
      const existingUser = await User.findOne({ email: userInput.email });

      if (existingUser) {
        throw new Error("User exists already!");
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