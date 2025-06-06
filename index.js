import express from "express";
import mongoose from "mongoose";
const PORT= process.env.PORT || 3000
import cors from "cors";
import userRoutes from "./routes/user.js"
import ticketRoutes from "./routes/ticket.js"
import dotenv from 'dotenv';
import {serve} from "inngest/express"
import {onUserSignup} from "./inngest/functions/sign-up.js"
import  {onTicketCreated} from "./inngest/functions/ticket.js"
import {inngest} from "./inngest/client.js"
dotenv.config();

const app=express();
app.use(cors());


app.use(express.json());


app.use(express.urlencoded({extended:true}));

//Router
app.use("/api/auth",userRoutes)
app.use("/api/tickets",ticketRoutes)


app.use("/api/inngest",
        serve({
                client:inngest,
                functions:[onUserSignup,onTicketCreated]
        })
);


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
