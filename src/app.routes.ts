import { Router } from "express";
import { AuthRouter } from "./module/auth/auth.routes";
import { UserRouter } from "./module/user/user.routes";

const router = Router();

router.use("/auth", AuthRouter);
router.use("/user", UserRouter);

export default router;
