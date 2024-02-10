import { Router } from "express";
import { AuthRouter } from "./module/auth/auth.routes";

const router = Router();

router.use("/auth", AuthRouter);

export default router;
