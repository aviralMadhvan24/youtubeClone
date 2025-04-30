
import dotenv from "dotenv";
import connectDB from "./db/index.js";

import { app } from "./app.js";

dotenv.config({
    path:'./.env'
});







connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
        
    })
})
.catch((error)=>{
console.log("MongoDB connection failed ",error);

})




// import dotenv from "dotenv"
// import connectDB from "./db"

// dotenv.config({
//     path:"./.env"
// })

// connectDB
// .then(()=>{
//     app.listen((process.env.PORT || 8000),()=>{
//         console.log("running at ",process.env.PORT)
//     })
// })
// .catch((error)=>{
//     console.log(error)
// })













// import express from "express";
// const app = express();


// (async()=>{
//     try {
//        await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         console.log("Connected to MongoDB successfully!");
//         app.on("error", (err) => {
//             console.log("Error: ", err);
//             throw err;
//         });



//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });



//     } catch (error) {
//         console.log("ERROR: ",error);
        
//     }
// })()