import dotenv from "dotenv"
import connectDb from "./DB/connection.js";
import app from "./app.js";

dotenv.config({
    path:"/.env"
})

connectDb().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log(" Mongo db conection Failed ", error)
})