// Connecting to the database using mongoDB

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://sreedhareg1997_db_user:eT6lQe9C74f65Jpq@node-complete.ra50bsw.mongodb.net/",
  )
    .then((client) => {
      console.log("CONNECTED");
      callback(client);
    })
    .catch((err) => console.log(err));
};

module.exports = mongoConnect
