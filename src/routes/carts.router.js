const express = require("express");
const router = express.Router();
const CartManager = require("../managers/CartManager");
const ProductManager = require("../managers/ProductManager");

const cm = new CartManager();
const pm = new ProductManager();

router.post("/", async (req, res) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cm.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to cart (increment quantity if exists)
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    // check product exists
    const product = await pm.getProductById(pid);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const cart = await cm.addProductToCart(cid, pid, 1);
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
