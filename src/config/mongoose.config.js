const mongoose = require("mongoose");
require('dotenv').config()

const connectToDB = async () => {
    await mongoose
        .connect(String(process.env.MONGODB_URL))
        .then(() => console.log("connected to DB."))
        .catch((err) => console.log(err?.message ?? "Failed DB connection"));
};

module.exports = connectToDB;
