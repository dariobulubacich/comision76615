const express = require("express");
const router = express.Router();
const ProductManager = require("../managers/ProductManager");

const pm = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const products = await pm.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await pm.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await pm.addProduct(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    // prevent id modification in body
    if (req.body.id && req.body.id !== req.params.pid) {
      return res.status(400).json({ error: "Cannot change product id" });
    }
    const updated = await pm.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await pm.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
