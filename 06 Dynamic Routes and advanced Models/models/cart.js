const fs = require("fs");
const path = require("path");

const p = path.join(path.dirname(require.main.filename), "data", "cart.json");

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(fileContent);
      }

      // Analyze the cart => Find existing product
      let existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id,
      );
      let existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      // Add new product / increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;

      // Save the cart
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        if (err) console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }

      const cart = JSON.parse(fileContent);

      if (!cart) {
        return;
      }

      const updatedCart = { ...cart };
      const product = updatedCart.products.find((prod) => prod.id === id);

      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id,
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * product.qty;

      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        if (err) console.log(err);
      });
    });
  }
};
