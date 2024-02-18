const path = require("path");
const createHttpError = require("http-errors");
const FilesMessage = require("./files.messages");

class FilesService {
    #formatValid;
    constructor() {
        this.#formatValid = [".jpg", ".jpeg", ".png", ".webp"];
    }

    async getFile(directory, fileName) {
        if (!fileName) throw createHttpError.BadRequest(FilesMessage.NotFound);
        if (!this.#formatValid.includes(path.extname(fileName)))
            throw createHttpError.BadRequest(FilesMessage.NotValidType);

        return this.sendFile(directory, fileName);
    }

    async sendFile(directory, fileName) {
        return path.join(__dirname, "../../..", "public", "uploads", directory, fileName);
    }
}

module.exports = FilesService;
