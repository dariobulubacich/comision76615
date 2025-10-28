const express = require("express");
const app = express();

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");

const PORT = 8080;

app.use(express.json());

// base path as /api
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// simple root
app.get("/", (req, res) => {
  res.send("API Productos y Carritos - Entrega 1");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
