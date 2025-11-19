const express = require("express");
const fs = require("fs");
const path = require("path");
const handlebars = require("express-handlebars");
const { v4: uuidv4 } = require("uuid");

const app = express();

// ============= MIDDLEWARES =============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// ============= HANDLEBARS =============
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));

// ============= ARCHIVOS JSON =============
const productsFile = path.join(__dirname, "../data/products.json");
const cartsFile = path.join(__dirname, "../data/carts.json");

// Helpers de persistencia
function readFile(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// =========================
//      RUTAS VIEWS
// =========================

// HOME — muestra todos los productos
app.get("/", (req, res) => {
  const products = readFile(productsFile);
  res.render("home", { products });
});

// Vista con WebSockets
app.get("/realtimeproducts", (req, res) => {
  const products = readFile(productsFile);
  res.render("realTimeProducts", { products });
});

// =========================
//     API PRODUCTS
// =========================
app.get("/api/products", (req, res) => {
  res.json(readFile(productsFile));
});

app.get("/api/products/:pid", (req, res) => {
  const products = readFile(productsFile);
  const product = products.find((p) => p.id === req.params.pid);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

app.post("/api/products", (req, res) => {
  const io = req.app.get("io");

  const required = [
    "title",
    "description",
    "code",
    "price",
    "stock",
    "category",
  ];
  for (const field of required) {
    if (!req.body[field])
      return res.status(400).json({ error: `Missing field: ${field}` });
  }

  const products = readFile(productsFile);

  const newProduct = {
    id: uuidv4(),
    ...req.body,
    status: req.body.status ?? true,
    thumbnails: req.body.thumbnails || [],
  };

  products.push(newProduct);
  writeFile(productsFile, products);

  // 🔥 Emitir actualización a websockets
  io.emit("productAdded", newProduct);

  res.status(201).json({ success: true, product: newProduct });
});

app.put("/api/products/:pid", (req, res) => {
  const products = readFile(productsFile);
  const i = products.findIndex((p) => p.id === req.params.pid);
  if (i === -1) return res.status(404).json({ error: "Not found" });

  products[i] = { ...products[i], ...req.body, id: products[i].id };
  writeFile(productsFile, products);

  res.json({ success: true, product: products[i] });
});

app.delete("/api/products/:pid", (req, res) => {
  const io = req.app.get("io");

  const products = readFile(productsFile);
  const i = products.findIndex((p) => p.id === req.params.pid);
  if (i === -1) return res.status(404).json({ error: "Not found" });

  const deleted = products.splice(i, 1)[0];
  writeFile(productsFile, products);

  // 🔥 Emitir actualización a websockets
  io.emit("productDeleted", deleted.id);

  res.json({ success: true });
});

// =========================
//       API CARTS
// =========================
app.post("/api/carts", (req, res) => {
  const carts = readFile(cartsFile);
  const newCart = { id: uuidv4(), products: [] };
  carts.push(newCart);
  writeFile(cartsFile, carts);
  res.status(201).json(newCart);
});

app.get("/api/carts/:cid", (req, res) => {
  const carts = readFile(cartsFile);
  const cart = carts.find((c) => c.id === req.params.cid);
  if (!cart) return res.status(404).json({ error: "Not found" });
  res.json(cart.products);
});

app.post("/api/carts/:cid/product/:pid", (req, res) => {
  const carts = readFile(cartsFile);
  const products = readFile(productsFile);

  const cart = carts.find((c) => c.id === req.params.cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  const prod = products.find((p) => p.id === req.params.pid);
  if (!prod) return res.status(404).json({ error: "Producto no encontrado" });

  const existing = cart.products.find((p) => p.product === req.params.pid);
  if (existing) existing.quantity++;
  else cart.products.push({ product: req.params.pid, quantity: 1 });

  writeFile(cartsFile, carts);

  res.json(cart);
});

module.exports = app;
