import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import path from "path";
import AppRouter from "./app.routes";
import ErrorExceptionHandler from "./common/exception/error.exception";
import NotFoundHandler from "./common/exception/notfound.exception";
import connectToDB from "./config/mongoose.config";
import SwaggerConfig from "./config/swagger.config";

dotenv.config();

const main = async () => {
    const app: Application = express();
    const port = process.env.PORT || 8000;
    // configs
    await connectToDB(); // connect to DataBase

    app.use(cors());
    app.use("/foods/covers", express.static(path.join(__dirname, "public", "foods", "covers")));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(process.env.COOKIE_SECRET_KEY));
    app.use(AppRouter);

    SwaggerConfig(app); // use swagger configuration
    NotFoundHandler(app);
    ErrorExceptionHandler(app);

    app.listen(port, () => console.log(`App listening on port ${port}`));
};

main();
