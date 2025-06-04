import jwt from "jsonwebtoken";


export const authenticate= (req,res,next)=>{
    const token=req.headers.authorization?.split(" ")[1]
    if(!token)
        return res.status(401).json({error:" Acces denied no token found"})
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err)
            return res.status(401).json({error:"Unauthorized"})
        req.user=user
        next()
    })

    try{
         jwt.verify(token,process.env.JWT_SECRET);
         req.user= dependencyInjectionMiddleware;
         next();

    }catch(error){
        res.status(500).json({error:"Authentication failed",
            details:error.message
        })
    }
}