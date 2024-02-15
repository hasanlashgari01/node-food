const autoBind = require("auto-bind");
const CategoryService = require("./category.service");

class CategoryController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new CategoryService();
    }

    async getAll(req, res, next) {
        res.json({ message: "This is category route" });
    }
}

module.exports = CategoryController;
