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
    const productCount = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search().filter().pagination(resultPerPage);
    const products = await apiFeatures.query;

    res.status(200).json({
        success: true,
        products,
        productCount
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

//Create Product Review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id, // Use req.user._id instead of req.body._id
        name: req.body.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numberofReviews = product.reviews.length;
    }

    let avg = 0;
    product.ratings = product.reviews.map((rev) => {
        avg += rev.rating;
        return rev.rating;
    });

    // Initialize ratings as an empty array if it doesn't exist
    product.ratings = product.ratings || [];

    // Calculate the average rating only if there are ratings
    if (product.ratings.length > 0) {
        product.averageRating = avg / product.ratings.length;
    }

    await product.save();

    res.status(200).json({
        success: true,
    });
});

//Get All Reviews 
exports.getAllReviews = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new errorHandler("Product Not Found",400))
    };
    res.status(200).json({
        success:true,
        reviews: product.reviews
    })
})

//Delete Review 
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new errorHandler("Product Not Found", 400));
    }

    // Find the index of the review to be deleted
    const reviewIndex = product.reviews.findIndex(
        (rev) => rev._id.toString() === req.query.id.toString()
    );

    // If the review is not found, return an error
    if (reviewIndex === -1) {
        return next(new errorHandler("Review Not Found", 404));
    }

    // Remove the review from the array
    product.reviews.splice(reviewIndex, 1);

    // Update the number of reviews
    product.numberOfReviews = product.reviews.length;

    // Recalculate the average rating
    let avg = 0;
    if (product.reviews.length > 0) {
        product.reviews.forEach((rev) => (avg += rev.rating));
        product.averageRating = avg / product.reviews.length;
    } else {
        product.averageRating = 0; // If there are no reviews, set average rating to 0
    }

    // Save the changes to the product
    await product.save();

    res.status(200).json({
        success: true,
    });
});
