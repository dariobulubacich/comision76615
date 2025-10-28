const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class CartManager {
  constructor(filename = "data/carts.json") {
    this.path = path.resolve(filename);
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.path, "utf8");
      return JSON.parse(data || "[]");
    } catch (err) {
      if (err.code === "ENOENT") {
        await this._writeFile([]);
        return [];
      }
      throw err;
    }
  }

  async _writeFile(data) {
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async createCart() {
    const carts = await this._readFile();
    const newCart = {
      id: uuidv4(),
      products: [],
    };
    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this._readFile();
    return carts.find((c) => String(c.id) === String(id));
  }

  async addProductToCart(cid, pid, quantity = 1) {
    const carts = await this._readFile();
    const idx = carts.findIndex((c) => String(c.id) === String(cid));
    if (idx === -1) return null;

    const cart = carts[idx];

    // find if product exists in cart
    const prodInCart = cart.products.find(
      (p) => String(p.product) === String(pid)
    );
    if (prodInCart) {
      prodInCart.quantity = Number(prodInCart.quantity) + Number(quantity);
    } else {
      cart.products.push({ product: String(pid), quantity: Number(quantity) });
    }

    carts[idx] = cart;
    await this._writeFile(carts);
    return cart;
  }
}

module.exports = CartManager;
