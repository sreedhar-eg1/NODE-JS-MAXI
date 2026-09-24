const fs = require("fs");

const express = require("express");

const app = express();

app.get("/", (req, res, next) => {
  fs.readFile("my-page.html", "utf-8", (err, data) => {
    res.send(data);
  });
});

app.listen(3000, () => console.log("Server running at port 3000"));
