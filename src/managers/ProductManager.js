const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class ProductManager {
  constructor(filename = "data/products.json") {
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

  async getProducts() {
    return await this._readFile();
  }

  async getProductById(id) {
    const products = await this._readFile();
    return products.find((p) => String(p.id) === String(id));
  }

  async addProduct(productData) {
    const products = await this._readFile();

    // validations minimal
    const required = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
    ];
    for (const r of required) {
      if (productData[r] === undefined) {
        throw new Error(`Missing field: ${r}`);
      }
    }

    // Ensure unique code (optional)
    if (products.some((p) => p.code === productData.code)) {
      throw new Error("Product with this code already exists");
    }

    const newProduct = {
      id: uuidv4(),
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: Number(productData.price),
      status: Boolean(productData.status),
      stock: Number(productData.stock),
      category: productData.category,
      thumbnails: Array.isArray(productData.thumbnails)
        ? productData.thumbnails
        : [],
    };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this._readFile();
    const idx = products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return null;

    // Do not allow id modification
    const toUpdate = { ...products[idx], ...updateData };
    toUpdate.id = products[idx].id;

    // If thumbnails provided ensure array
    if (updateData.thumbnails && !Array.isArray(updateData.thumbnails)) {
      toUpdate.thumbnails = products[idx].thumbnails;
    }

    products[idx] = toUpdate;
    await this._writeFile(products);
    return products[idx];
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const newProducts = products.filter((p) => String(p.id) !== String(id));
    if (newProducts.length === products.length) return false;
    await this._writeFile(newProducts);
    return true;
  }
}

module.exports = ProductManager;
