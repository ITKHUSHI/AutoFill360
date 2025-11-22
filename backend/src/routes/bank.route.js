import Router from "express"
import { addBankDetails } from "../controllers/bank.controller.js";

const router=Router()

router.route("/add-bank-details").post(addBankDetails)

export default router;