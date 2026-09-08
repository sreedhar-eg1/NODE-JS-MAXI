const path = require("path");
const fs = require("fs");

const clearImage = (imagePath) => {
  const filePath = path.join(__dirname, "..", imagePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.clearImage = clearImage; //Common JS module exports
