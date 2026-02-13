const { ObjectId } = require("mongodb");

const { getDb } = require("../util/database");

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = new ObjectId(id);
  }

  save() {
    const db = getDb();

    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString(),
    );

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    const db = getDb();

    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  getCart() {
    const db = getDb();

    const productIds = this.cart.items.map(
      (item) => new ObjectId(item.productId),
    );

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) =>
        products.map((product) => ({
          ...product,
          quantity: this.cart.items.find(
            (item) => item.productId.toString() === product._id.toString(),
          ).quantity,
        })),
      )
      .catch((err) => console.log(err));
  }

  deleteItemFromCart(prodId) {
    const db = getDb();

    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== prodId.toString(),
    );

    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: { items: updatedCartItems } } });
  }

  static findById(userId) {
    const db = getDb();

    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
