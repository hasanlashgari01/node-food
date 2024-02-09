const express = require("express");
const dotenv = require("dotenv");
const connectToDB = require("./src/config/mongoose.config");
const SwaggerConfig = require("./src/config/swagger.config");

dotenv.config();

const main = async () => {
  const app = express();
  const port = process.env.PORT;
  // configs
  await connectToDB(); // connect to DataBase
  SwaggerConfig(app); // use swagger configuration

  app.listen(port, () => console.log(`app listening on port ${port}`));
};

main();
