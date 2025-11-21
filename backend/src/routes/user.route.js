import { Router } from "express";
import { signUp,login,logout,userDetails, requestPasswordReset, resetPassword } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router=Router()

router.route("/sign-up").post(signUp)
router.route("/login").post(login)
router.route("/logout").post(authenticate,logout)
router.route("/profile").get(authenticate,userDetails)
router.route("/forgot-password").post(authenticate,requestPasswordReset)
router.route("/reset-password").post(authenticate,resetPassword)

export default router