import mongoose from "mongoose";
import "dotenv/config";

const connectToDB = async () => {
    await mongoose
        .connect(String(process.env.MONGODB_URL))
        .then(() => console.log("connected to DB."))
        .catch((err) => console.log(err?.message ?? "Failed DB connection"));
};

export default connectToDB;
