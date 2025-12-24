const express = require("express");
const router = express.Router();
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");

router.get("/products", async (req, res) => {
  const products = await Product.paginate(
    {},
    { limit: 10, page: req.query.page || 1, lean: true }
  );

  res.render("index", {
    products: products.docs,
    hasPrevPage: products.hasPrevPage,
    hasNextPage: products.hasNextPage,
    prevPage: products.prevPage,
    nextPage: products.nextPage,
  });
});

router.get("/products/:pid", async (req, res) => {
  const product = await Product.findById(req.params.pid).lean();
  res.render("productDetail", { product });
});

router.get("/carts/:cid", async (req, res) => {
  const cart = await Cart.findById(req.params.cid)
    .populate("products.product")
    .lean();

  res.render("cart", { products: cart.products });
});

module.exports = router;
