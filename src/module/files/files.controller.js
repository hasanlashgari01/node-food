const autoBind = require("auto-bind");
const FilesService = require("./files.service");

class FilesController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new FilesService();
    }

    async getFood(req, res, next) {
        try {
            let { fileName } = req.params;
            const result = await this.#service.getFile("food", fileName);

            res.sendFile(result);
        } catch (error) {
            next(error);
        }
    }

    async getMenu(req, res, next) {
        try {
            let { fileName } = req.params;
            const result = await this.#service.getFile("menu", fileName);

            res.sendFile(result);
        } catch (error) {
            next(error);
        }
    }

    async getRestaurant(req, res, next) {
        try {
            let { fileName } = req.params;
            const result = await this.#service.getFile("restaurant", fileName);

            res.sendFile(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FilesController;
