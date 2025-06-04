import express from "express";
import mongoose from "mongoose";
const PORT= process.env.PORT || 3000
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

const app=express();
app.use(cors());


app.use(express.json());


app.use(express.urlencoded({extended:true}));

console.log("process.env.GEMINI_API_KEY",process.env.MONGO_URI)
mongoose
        .connect(process.env.MONGO_URI , { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
                console.log("Connected to MongoDB");
                app.listen(PORT, () => {
                        console.log(`Server running on port ${PORT}`);
                })    
        })
        .catch((err)=>{
            console.log("MongoDB connection error",err)
        })
