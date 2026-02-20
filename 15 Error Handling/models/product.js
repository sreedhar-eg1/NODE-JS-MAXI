const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // means this userId will be the reference to the User model
    required: true
  }
});

// To connects the schema to the database with a name
// pural of the model name will be the collection name
module.exports = mongoose.model("Product", productSchema)