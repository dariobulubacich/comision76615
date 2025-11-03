const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("🚀 Comenzando con Mi Tienda");
});

const productsFile = path.join(__dirname, "../data/products.json");
const cartsFile = path.join(__dirname, "../data/carts.json");

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data || "[]");
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.get("/api/products", (req, res) => {
  try {
    const products = readFile(productsFile);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al leer los productos" });
  }
});

app.get("/api/products/:pid", (req, res) => {
  try {
    const { pid } = req.params;
    const products = readFile(productsFile);
    const product = products.find((p) => p.id === pid);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

app.post("/api/products", (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const products = readFile(productsFile);
    const newProduct = {
      id: uuidv4(),
      title,
      description,
      code,
      price,
      status: status ?? true,
      stock,
      category,
      thumbnails: thumbnails || [],
    };

    products.push(newProduct);
    writeFile(productsFile, products);
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

app.put("/api/products/:pid", (req, res) => {
  try {
    const { pid } = req.params;
    const products = readFile(productsFile);
    const index = products.findIndex((p) => p.id === pid);

    if (index === -1)
      return res.status(404).json({ error: "Producto no encontrado" });

    const updatedProduct = {
      ...products[index],
      ...req.body,
      id: products[index].id,
    };
    products[index] = updatedProduct;

    writeFile(productsFile, products);
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

app.delete("/api/products/:pid", (req, res) => {
  try {
    const { pid } = req.params;
    const products = readFile(productsFile);
    const index = products.findIndex((p) => p.id === pid);

    if (index === -1)
      return res.status(404).json({ error: "Producto no encontrado" });

    products.splice(index, 1);
    writeFile(productsFile, products);
    res
      .status(200)
      .json({ success: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

app.post("/api/carts", (req, res) => {
  try {
    const carts = readFile(cartsFile);
    const newCart = { id: uuidv4(), products: [] };
    carts.push(newCart);
    writeFile(cartsFile, carts);
    res.status(201).json({ success: true, cart: newCart });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

app.get("/api/carts/:cid", (req, res) => {
  try {
    const { cid } = req.params;
    const carts = readFile(cartsFile);
    const cart = carts.find((c) => c.id === cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

app.post("/api/carts/:cid/product/:pid", (req, res) => {
  try {
    const { cid, pid } = req.params;
    const carts = readFile(cartsFile);
    const products = readFile(productsFile);

    const cartIndex = carts.findIndex((c) => c.id === cid);
    if (cartIndex === -1)
      return res.status(404).json({ error: "Carrito no encontrado" });

    const product = products.find((p) => p.id === pid);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    const cart = carts[cartIndex];
    const existingProduct = cart.products.find((p) => p.product === pid);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    carts[cartIndex] = cart;
    writeFile(cartsFile, carts);

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

module.exports = app;
