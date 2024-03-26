const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const AppRouter = require("./app.routes");
const connectToDB = require("./config/mongoose.config");
const SwaggerConfig = require("./config/swagger.config");
const NotFoundHandler = require("./common/exception/notfound.exception");
const ErrorExceptionHandler = require("./common/exception/error.exception");
require("dotenv").config();

const main = async () => {
    const app = express();
    const port = process.env.PORT || 8000;
    // configs
    await connectToDB(); // connect to DataBase

    app.use(cors({ origin: true, credentials: true }));
    app.use("/public/uploads", express.static(path.join(__dirname, "public", "uploads")));
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(AppRouter);

    SwaggerConfig(app); // use swagger configuration
    NotFoundHandler(app);
    ErrorExceptionHandler(app);

    app.listen(port, () => console.log(`App listening on port ${port}`));
};

main();
