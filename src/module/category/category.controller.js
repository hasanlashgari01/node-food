const autoBind = require("auto-bind");
const CategoryService = require("./category.service");
const CategoryMessage = require("./category.messages");

class CategoryController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new CategoryService();
    }

    async getAll(req, res, next) {
        try {
            const categories = await this.#service.getCategories({});

            res.json(categories);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body);

            res.status(201).json({ message: CategoryMessage.Created });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const body = req.body;
            await this.#service.editCategory(id, body);

            res.json({ message: CategoryMessage.Updated });
        } catch (error) {}
    }

    async getCategory(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.#service.checkExistById(id);

            res.json(result);
        } catch (error) {}
    }

    async getCategoryTitle(req, res, next) {
        try {
            const categories = await this.#service.getTitles();

            res.json(categories);
        } catch (error) {
            next(error);
        }
    }

    async searchByTitle(req, res, next) {
        try {
            const categories = await this.#service.searchCategoriesByTitle(req.params);

            res.json(categories);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CategoryController;
