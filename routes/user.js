import express from "express";
import { getuser, signup, Updateuser } from "../controllers/user.js";
import { login } from "../controllers/user.js";
import { logout } from "../controllers/user.js";
import { authenticate } from "../middelwares/auth.js";



const router = express.Router()

router.post("/update-user",authenticate,Updateuser)
router.get("/get-user",authenticate,getuser)

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)


export default router;
