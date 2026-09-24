// const fs = require("fs");
import fs from "fs";

const resHandler = (req, res, next) => {
  fs.readFile("my-page.html", "utf-8", (err, data) => {
    res.send(data);
  });
};

// module.exports = resHandler;
export default resHandler;
