import autoBind from "auto-bind";
import { NextFunction, Request, Response } from "express";
import UserService from "./user.service";

class UserController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new UserService();
    }

    async whoAmI(req: Request, res: Response, next: NextFunction) {
        try {

            return res.json(req.user);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
