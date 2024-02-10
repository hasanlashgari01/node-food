import { Application } from "express";

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const swaggerDocument = swaggerJsDoc({
    swaggerDefinition: {
        info: {
            title: "Food API",
            description: "by Hasan Lashgari",
            version: "1.0.0",
        },
    },
    apis: [process.cwd() + "/src/module/**/*.swagger.js"],
});

const SwaggerConfig = (app: Application) => {
    app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {}));
};

export default SwaggerConfig;
