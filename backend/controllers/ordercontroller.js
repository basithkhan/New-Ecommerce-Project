const Order = require("../models/ordermodel");
const Product = require("../models/productmodels");
const errorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");

exports.newOrder = catchAsyncError(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(200).json({
        success:true,
        order
    })
});

//Get Single Orders
exports.getSingleOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new errorHandler("Order Not Found",400))
    };

    res.status(200).json({
        success:true,
        order,
    });
});

//Get Loggedin User Orders
exports.myOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find({user:req.user._id})

    res.status(200).json({
        success:true,
        orders,
    });
});

//Get All Orders
exports.getAllOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((order)=>{
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});

//Update Order Status
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new errorHandler("Order not found", 404));
    }

    if (order.orderstatus === "Delivered") {
        return next(new errorHandler("Order Has Already Been Delivered", 400));
    }

    // Use map instead of forEach to iterate over orderItems
    await Promise.all(order.orderItems.map(async (orderItem) => {
        await updateStock(orderItem.product, orderItem.quantity);
    }));

    // Update order status
    order.orderstatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        order,
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    if (!product) {
        throw new errorHandler(`Product not found with id: ${id}`, 404);
    }

    product.stock -= quantity;

    await product.save({ validateBeforeSave: false });
}



//Delete Order
exports.deleteOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new errorHandler("Order Does Not Found", 400))
    };

    await order.deleteOne();

    res.status(200).json({
        success:true,
    })
})