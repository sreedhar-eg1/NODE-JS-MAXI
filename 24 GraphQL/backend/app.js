const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { createYoga } = require("graphql-yoga");
const { GraphQLError } = require("graphql");

const schema = require("./graphql/schema");
const rootValue = require("./graphql/resolvers");

const app = express();

const yoga = createYoga({
  schema,
  rootValue,
  maskedErrors: {
    maskError(error, message, isDev) {
      const original = error.originalError || error;

      // Pass through errors you threw intentionally (they're "safe")
      if (original instanceof GraphQLError) {
        return original;
      }

      // Anything else is unexpected — hide the details
      // console.error(error);
      return new GraphQLError("Something went wrong.");
    },
  },
});

const filestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: filestorage, fileFilter: fileFilter }).single(
  "image",
);

// app.use(bodyParser.urlencoded({extended: false})); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(upload);

// Handling CORS Errors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.use("/graphql", yoga);

mongoose
  .connect(
    "mongodb+srv://sreedhareg1997_db_user:eT6lQe9C74f65Jpq@node-complete.ra50bsw.mongodb.net/graphQlMessages",
  )
  .then(() => {
    app.listen(8080, () =>
      console.log("Connected to Database and running on port 8080"),
    );
  })
  .catch((err) => console.log(err));
