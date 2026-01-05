import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
});

import connectDB from "./db/db.js";
import { app } from "./app.js";


  

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`server is running on port: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed !!! ",err);
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
