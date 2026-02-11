// Connecting to the database using mongoDB

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db; //here _db means, a standard to indicate that this variable will be used in this file only

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://sreedhareg1997_db_user:eT6lQe9C74f65Jpq@node-complete.ra50bsw.mongodb.net/shop",
  )
    .then((client) => {
      console.log("CONNECTED");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err
    });
};

const getDb = () => {
  if(_db) {
    return _db
  }

  throw 'No database found!'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb
