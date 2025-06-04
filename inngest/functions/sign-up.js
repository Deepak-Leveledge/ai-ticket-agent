import { NonRetriableError } from "inngest";
import {inngest} from "../client";
import User from "../models/user.js";
import { sendMail } from "../../utils/mailer";

export const onUserSignup= inngest.createFunction(
    {id:"on-user-signup",retries:3},
    {event:"user/signup"},
    async ({event,step})=>{
        try{
            const {email}=event.data
            const user=await step.run("get-user-email",async()=>{
                const userobject= await User.findOne({email})
                if (!userobject){
                    throw new NonRetriableError("uswer no longer exixt in our database")
                }
                return userobject
            })


            await step.run("send-welcome-email",async()=>{
                const subject=`Welcome to ai-ticket-assitant`
                const message =`Hi,
                \n\n
                Thanks for signing up to ai-ticket-assitant. We're excited to have you on board.`

                await sendMail(user.email,subject,message)
            })

            return {succes:true}







        }catch(error){
            console.log("ERror runnin step",error.message)
            return {succes:false}

        }
        
    }
);