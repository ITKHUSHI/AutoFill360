import Router from "express";
import {generatePdf} from "../controllers/file.controller.js"


const router=Router()
router.route("/generate-pdf").post(generatePdf)


export default router