const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectToDB = async () => {
  await mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("connected to DB."))
    .catch(err => console.log(err?.message ?? "Failed DB connection"));
};

module.exports = connectToDB;
