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

    res.status(error.statusCode).json({        
        success : false,
        message : err.message,});
};