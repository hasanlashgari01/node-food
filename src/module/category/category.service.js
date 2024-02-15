const CategoryModel = require("./category.schema");

class CategoryService {
    #model;
    constructor() {
        this.#model = CategoryModel;
    }
}

module.exports = CategoryService;
