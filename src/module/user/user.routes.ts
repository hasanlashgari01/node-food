import { Router } from "express";
import controller from "./user.controller";
import AccessTokenGuard from "../../common/guard/auth.guard";

const router = Router();

router.get("/whoami", AccessTokenGuard, controller.whoAmI);

export { router as UserRouter };
