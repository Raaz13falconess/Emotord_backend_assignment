import { Router } from "express";
import { addData,getData } from "../controllers";
const router=Router()

router.post('/',addData)
router.get('/',getData)

export default router