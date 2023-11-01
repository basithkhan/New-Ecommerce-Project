const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProducts, getProductDetails } = require("../controllers/productcontrollers");
const router=express.Router();

router.route("/products").get(getAllProducts)
router.route("/product/new").post(createProduct)
router.route("/product/:id").put(updateProduct).delete(deleteProducts).get(getProductDetails)

module.exports = router