const Product = require ("../models/productmodels");
const errorHandler = require('../utils/errorhandler');
const catchAsyncError = require("../middleware/catchAsyncError")
const ApiFeatures = require("../utils/apifeatures");

//create product  --- admin 
exports.createProduct = catchAsyncError( async (req,res,next)=>{
    const product = await Product.create(req.body)
    res.status(201).json({
        success:true,
        product
    })
});

// get all products
exports.getAllProducts = catchAsyncError(async (req, res) => {
    const resultPerPage = 10;
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search().filter().pagination(resultPerPage);
    const products = await apiFeatures.query;

    res.status(200).json({
        success: true,
        products
    });
});

// get product details
exports.getProductDetails = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!Product){
        return next(new errorHandler("product not found",404));
    }
    await res.status(200).json({
        success:true,
        product
    })
});

// update products
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    const productId = req.params.id;
    const updateData = req.body; // Assuming the updated data is sent in the request body

    // First, check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(new errorHandler("Product not found", 404));
    }

    // Update the product using findByIdAndUpdate
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData, // Use the data from the request body to update the product
        { new: true, runValidators: true, useFindAndModify: false }
    );

    res.status(200).json({
        success: true,
        product: updatedProduct, // Send the updated product data in the response
    });
});

// delete product 
exports.deleteProducts = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new errorHandler("product not found",404));
    };
    
    await product.deleteOne();
    res.status(200).json({
        success:true,
        message:"product deleted successfully"
    })
});