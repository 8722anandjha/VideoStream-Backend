
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
dotenv.config({
    path:'.env'
});
  
connectDB();
const app = express();
const PORT= process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is running on PORT:${PORT}`)
})































/*
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error;
        })
        app.listen(process.env.PORRT,()=>{
            console.log(`App is listening on port ${process.env.PORRT}`)
        })
    }catch(error){
        console.log("ERROR:",error);
        throw error;
    }
})()
*/
