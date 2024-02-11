import { Router } from "express";
import controller from "./auth.controller";

const router = Router();

router.post("/send-otp", controller.sendOtp);
router.post("/check-otp", controller.checkOtp);

export { router as AuthRouter };
