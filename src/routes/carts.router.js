const express = require("express");
const router = express.Router();
const Cart = require("../models/cart.model");

router.get("/:cid", async (req, res) => {
  const cart = await Cart.findById(req.params.cid)
    .populate("products.product")
    .lean();

  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }

  res.json(cart);
});

router.delete("/:cid/products/:pid", async (req, res) => {
  await Cart.findByIdAndUpdate(req.params.cid, {
    $pull: { products: { product: req.params.pid } },
  });
  res.json({ status: "success" });
});

router.put("/:cid", async (req, res) => {
  const { products } = req.body;
  await Cart.findByIdAndUpdate(req.params.cid, { products });
  res.json({ status: "success" });
});

router.put("/:cid/products/:pid", async (req, res) => {
  const { quantity } = req.body;

  await Cart.updateOne(
    { _id: req.params.cid, "products.product": req.params.pid },
    { $set: { "products.$.quantity": quantity } }
  );

  res.json({ status: "success" });
});

router.delete("/:cid", async (req, res) => {
  await Cart.findByIdAndUpdate(req.params.cid, { products: [] });
  res.json({ status: "success" });
});

module.exports = router;
