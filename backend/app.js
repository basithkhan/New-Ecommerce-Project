const express = require("express");
const app = express();
const errorMiddleWare = require("./middleware/error");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser())
// route imports
const product = require("./route/productroute");
const user = require("./route/userRoute");
const order = require("./route/orderroute");

app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);

// error middleware
app.use(errorMiddleWare);

module.exports = app;
