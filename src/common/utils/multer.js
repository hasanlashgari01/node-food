const multer = require("multer");
const fs = require("fs");
const path = require("path");
const createHttpError = require("http-errors");
const { randomInt } = require("crypto");

const publicPath = "./public/uploads";
const privatePath = "./private/uploads";

const foodUpload = () => upload(false, "food", 1).single("cover");
const menuUpload = () => upload(false, "menu", 1).single("image");
const restaurantUpload = () => {
    return upload(false, "restaurant", 1).fields([
        { name: "logo", maxCount: 1 },
        { name: "cover", maxCount: 1 },
    ]);
};

const storage = (isPrivate, directory) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            createDirectory(directory);
            cb(null, `${isPrivate === false ? publicPath : privatePath}/${directory}`);
        },
        filename: (req, file, cb) => {
            const whiteListFormat = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (whiteListFormat.includes(file.mimetype)) {
                const format = path.extname(file.originalname);
                const fileName = generateFileName() + format;
                cb(null, fileName);
            } else {
                cb(new createHttpError.BadRequest("Invalid file type!"));
            }
        },
    });
};

const createDirectory = (path) => {
    fs.mkdirSync(`./public/uploads/${path}`, { recursive: true }, (err) => {
        if (err) throw err;
    });
};

const generateFileName = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const now = new Date().getTime();
    const randomNumber = randomInt(1_000_000, 999_999_999_999);
    const fileName = `${today}${now}${randomNumber}`;
    return fileName;
};

const upload = (isPrivate, dir, size) => {
    return multer({
        storage: storage(isPrivate, dir),
        limits: { fileSize: 1024 * 1024 * size }, // 1 MB
    });
};

module.exports = { foodUpload, menuUpload, restaurantUpload };
