import Router from "express";
import {generatePdf} from "../controllers/file.controller.js"
import {authenticate} from "../middleware/auth.middleware.js"

const router=Router()
router.route("/generate-pdf").post(generatePdf)


export default router