// const fs = require("fs");
// import fs from "fs";
import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const _fileName = fileURLToPath(import.meta.url); // Will give path to the current file
const __dirname = dirname(_fileName); // gives path to the current folder

const resHandler = async (req, res, next) => {
  //   fs.readFile("my-page.html", "utf-8", (err, data) => {
  //     res.send(data);
  //   });

  //   Making use of promises in code Node Api
  try {
    const data = await fs.readFile("my-page.html", "utf-8");
    res.send(data);
  } catch (error) {
    console.log(error);
  }

  //   res.sendFile(path.join(__dirname, "my-page.html"));
};

// module.exports = resHandler;
export default resHandler;
