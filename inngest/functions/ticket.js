import { NonRetriableError } from "inngest";
import {inngest} from "../client";
import User from "../models/user.js";
import { sendMail } from "../../utils/mailer";
import Ticket from "../models/ticket.js";
import analyzeTicket from "../../utils/ai.js";
import { assign } from "nodemailer/lib/shared/index.js";
import { captureRejectionSymbol } from "nodemailer/lib/xoauth2/index.js";


export const onTicketCreated= inngest.createFunction(
    {id:"ticket-created",retries:3},
    {event:"ticket/created"},

    async ({event,step})=>{
        try{
            const {ticketId}=event.data

            //fetch ticket from database

            const ticket=await step.run("fetch-ticket",async()=>{
                const ticketobject=Ticket.findbyId(ticketId)
                if(!ticket){
                    throw new NonRetriableError("ticket no longer exixt in our database")
                }

                return ticketobject
            })


            await step.run("update-ticket-status"),async()=>{
                await Ticket.findbyIdAndUpdate(ticket._id,{stauts:"TODO"})
            }


            const aiResponse=await analyzeTicket(ticket)

            const relatedSkills=await step.run("ai=processing",async()=>{
                let skills=[]
                if(aiResponse){
                    await Ticket.findbyIdAndUpdate(ticket._id,{
                        priority:!["low","medium","high"].includes(aiResponse.priority)? "low":aiResponse.priority,
                        helpfulNotes:aiResponse.helpfulNotes,
                        status:"IN_PROGRESS",
                        relatedSkills:aiResponse.relatedSkills
                    })
                    skills= aiResponse.relatedSkills
                }
                return skills
            })


            const moderator = await step.run("assign-moderator",
                async()=>{
                    let user =await User.findOne({role:"moderator",
                        skills:{$elemMatch:{
                            $regex:relatedSkills.join("|"),
                            $options:"i"
                        }}
                    })
                    if(!user){
                        user=await User.findOne({role:"admin"})
                    }

                    await Ticket.findbyIdAndUpdate(ticket._id,{assignedTo:user?._id ||null})
                    return user

                    
                    
                }

            )
            await set.run("send-email-notification"),async ()=>{
                if(moderator){
                    const finalTicket=await Ticket.findbyId(ticket._id)
                    await sendMail(moderator.email,"New ticket created",`A new ticket has been created and assigned to you. Please review and take appropriate actions.
                        ${finalTicket.title}`)
                }
            }
            return {success:true}
           


        }catch (error){
            console.error("Error running the ticket-created function",error.message)
            return {success:false}
        }
    }

);
