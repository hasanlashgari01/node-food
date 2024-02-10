import { Application, NextFunction, Request, Response } from "express";
import HttpException from "./http.exception";

const ErrorExceptionHandler = (app: Application) => {
    app.use((error: HttpException, req: Request, res: Response, next: NextFunction): void => {
        const status = error.status || 500;
        const message = error.message || "Internal Server Error";
        res.status(status).send({
            status,
            message,
        });
    });
};

export default ErrorExceptionHandler;
