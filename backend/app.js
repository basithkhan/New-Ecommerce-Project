const express = require("express");
const app = express();
const errorMiddleWare = require("./middleware/error");

app.use(express.json());
// route imports
const product = require("./route/productroute");
app.use("/api/v1",product)

// error middleware
app.use(errorMiddleWare);

module.exports = app;
