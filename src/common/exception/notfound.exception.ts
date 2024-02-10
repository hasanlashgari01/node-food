import { Application, NextFunction, Request, Response } from "express";

const NotFoundHandler = (app: Application) => {
    app.use((req: Request, res: Response, next: NextFunction): void => {
        res.status(404).json({
            message: "Not Found Route",
        });
    });
};
export default NotFoundHandler;
