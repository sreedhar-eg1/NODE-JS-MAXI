const path = require("path");
const fs = require("fs");

const accessLogSream = fs.createWriteStream(
  path.join(process.cwd(), "access.log"),
  { flags: "a" }, // append the new content to the end of the file
);

module.exports = accessLogSream;
