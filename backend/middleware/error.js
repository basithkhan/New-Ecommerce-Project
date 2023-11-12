const errorHandler = require('../utils/errorhandler');

module.exports = (err, req, res, next) => {
    const error = {}
    error.statusCode = err.statusCode || 500;
    error.message = err.message || "internal server error";

    //wrong mongodb id error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new errorHandler(message, 404);
    }

    //mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new errorHandler(message, 400);
    }    

    //wrong jwt error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid, Try again`,
        err = new errorHandler(message,400);
    }

    //jwt expire error
    if(err.name === "TokenExpireError"){
        const message = `Json Web Token is expired, Try again`,
        err = new errorHandler(message,400);
    }

    res.status(error.statusCode).json({        
        success : false,
        message : err.message,});
};