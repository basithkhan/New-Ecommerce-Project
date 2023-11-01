const app = require("./app.js")
const dotenv = require("dotenv")
const connectDataBase = require("./config/database.js");

//handling uncaught exception
process.on('uncaughtException',(err)=>{
    console.log(`Error ${err.message}`)
    console.log("Shuttin down server due to uncaught exception")
    process.exit(1)
})

//config
dotenv.config({path:"backend/config/config.env"})
connectDataBase()

const server = app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})

// unhandeled promise rejection  
process.on('unhandledRejection', (err)=>{
    console.log(`error ${err.message}`);
    console.log("shutting down the server due to unhandeled promise rejection");
    server.close(()=>{
        process.exit(1);
    });
})