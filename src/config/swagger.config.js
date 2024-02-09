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
  apis: [],
});

const SwaggerConfig = app => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {}));
};

module.exports = SwaggerConfig;
