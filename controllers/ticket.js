import {} from "../inngest/client.js"
import Ticket from "../models/ticket.js"

export const createTicket =async(req,res)=>{
    try{

         const {title,description}=req.body;
         if (!title || !description){
            return res.status(400).json({message:"Title and description is required"})
         }

        const newTicket=await Ticket.create({title,description,createdBy:req.user._id.toString()})
        res.json(newTicket)    


        await inngest.send({
            name:"ticket/created",
            data:{
                ticketId:(await newTicket)._id.toString(),
                title,
                description,
                createdBy:req.user._id.toString()
            }
        })
        return res.status(201).json({message:"Ticket created",
            ticket:newTicket
        })


    }catch(error){
        console.error("Error creating ticket",error.message)
        return res.status(500).json({message:"Error creating ticket"})

    }
}


export const getTickets=async(req,res)=>{
    try{
        const user =req.user
        let tickets =[]
        if (user.role!=="user"){
            tickets =Ticket.find({})
            .populate("assignedTo",["email","_id"])
            .sort({createdAt:-1})
        }else{
            tickets=await Ticket.find({createdBy:user._id.toString()})
            .select("title description createdAt")
            .sort({createdAt:-1})
        }
        return res.status(200).json({message:"All tickets",
            tickets
        })

    }
    catch(error){
        console.error("Error getting All tickets",error.message)
        return res.status(500).json({message:"Error getting  All tickets"})
    }
}



export const getTicket=async(req,res)=>{
    try{
        const user= req.user
        let ticket;
        if (user.role!=="user"){
            ticket= Ticket.findById(req.params.id)
            .populate("assignedTo",["email","_id"])
        }else{
            ticket= Ticket.findOne({createdBy:user._id,
                _id:req.params.id

            }).select("title description assignedTo createdAt")
        }

        if (!ticket){
            return res.status(404).json({message:"Ticket not found"})
        }
        return res.status(200).json({message:"Ticket found",
            ticket
        })

    }catch(error){
        console.error("Error getting ticket",error.message)
        return res.status(500).json({message:"Error getting ticket"})
}
}