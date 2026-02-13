const mongodb = require("mongodb");

const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, imageUrl, description, id, userId) {
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = new mongodb.ObjectId(userId)
  }

  save() {
    const db = getDb();
    const collection = db.collection("products");
    let dbOp;

    if (this._id) {
      const productData = {
        title: this.title,
        price: this.price,
        imageUrl: this.imageUrl,
        description: this.description,
      };

      dbOp = collection.updateOne({ _id: this._id }, { $set: productData });
    } else {
      dbOp = collection.insertOne(this);
    }

    return dbOp;
  }

  static fetchAll() {
    const db = getDb();

    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => products)
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();

    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((product) => product)
      .catch((err) => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb();

    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(prodId) });
  }
}

module.exports = Product;
