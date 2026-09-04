const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { createYoga } = require("graphql-yoga");
const { GraphQLError } = require("graphql");

const auth = require("./middleware/auth");
const schema = require("./graphql/schema");
const rootValue = require("./graphql/resolvers");

const app = express();

const yoga = createYoga({
  schema,
  rootValue,
  maskedErrors: {
    maskError(error, message, isDev) {
      const original = error.originalError || error;
      if (original instanceof GraphQLError) {
        return original;
      }
      return new GraphQLError("Something went wrong.");
    },
  },
  context: ({ request, req, res }) => ({
    req,
    res,
  }),
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

app.use(bodyParser.json());

// --- CORS: handle this FIRST, and short-circuit OPTIONS before anything else ---
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // preflight ends here, never reaches auth/multer/etc.
  }
  next();
});

app.use(upload);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(auth);

// Method now matches the frontend's fetch call (PUT)
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    return res.status(401).json({ message: "Not Authenticated!" });
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }

  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }

  res.status(201).json({ message: "File Stored!", filePath: req.file.path });
});

app.use("/graphql", yoga);

// Error handler goes LAST, after every route, so it can actually catch their errors
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

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

const clearImage = (imagePath) => {
  const filePath = path.join(__dirname, "..", imagePath);
  fs.unlink(filePath, (err) => console.log(err));
};