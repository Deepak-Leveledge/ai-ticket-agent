import brcypt from "bcrypt"
import User from "../models/user.js"
import jwt from "jsonwebtoken"
import { Inngest } from "inngest"


export const signup=async(req,res)=>{
    const{email,password,skills=[]}=req.body

    try{
        const hashedPassword=await brcypt.hash(password,10)
        const user=await User.create({email,password:hashedPassword,skills})
        
        //fire inngest
        await inngest.send({
            name:"user/signup",
            data:{email}
        });

        const token=jwt.sign({_id:user._id,role:user.role},
            process.env.JWT_SECRET
        );


        res.json({user,token})


    }catch(error){
        res.status(500).json({error:"Signup failed",
            details:error.message
        })
    }

}


export const login=async(req,res)=>{
    const{email,password}=req.body
    try{
        const user=User.findOne({email})
        if(!user)
            return res.status(404).json({error:"User not found"})

        const isMatch=brcypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({error:"Invalid credentials"})
        }

        const token=jwt.sign({_id:user._id,role:user.role},
            process.env.JWT_SECRET
        );


        res.json({user,token})



     

    }catch(error){
        res.status(500).json({error:"Login failed",
            details:error.message
        })
    }
}

export const logout=async(req,res)=>{
    try{
        req.header.authorization.split(" ")[1]

    }catch(error){
        res.status(500).json({error:"Logout failed",
            details:error.message
        })
    }
}