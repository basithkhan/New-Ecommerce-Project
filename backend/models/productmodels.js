const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter product name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"please enter product description"]
    },
    price:{
        type:Number,
        required:[true,"please enter product price"],
        maxLength:[8,"price cannot exceed more than one crore"]
    },
    rating:{
        type:Number,
        default:0,
        required:false
    },
    image:[
    {public_id:{
            type:String,
            required:false
        },
        url:{
            type:String,
            required:false
        }}
    ],
    category:{
        type:String,
        required:[true,"please enter product category"],
    },
    stock:{
        type:Number,
        required:[true,"please enter product stock"],
        maxLength:[4,"stock cannot be more than thousand"]
    },
    numberofReviews:{
        type:Number,
        default:0,
        required : false
    },
    review:{
        name:{
            type:String,
            require:false,
        },
        ratings:{
            type:Number,
            required:false,
        },
        comment:{
            type:String,
            required:false,
        },
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("product",ProductSchema)