import { Router } from "express";
import controller from "./auth.controller";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);

export { router as AuthRouter };
