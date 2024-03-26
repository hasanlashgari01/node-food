const { isValidObjectId, Types } = require("mongoose");
const createHttpError = require("http-errors");
const slugify = require("slugify");
const CategoryModel = require("./category.schema");
const CategoryMessage = require("./category.messages");

class CategoryService {
    #model;

    constructor() {
        this.#model = CategoryModel;
    }

    async getCategories() {
        return await this.#model.find({ parent: { $exists: false } });
    }

    async create(categoryDto) {
        if (categoryDto?.slug) {
            categoryDto.slug = slugify(categoryDto.slug);
            await this.alreadyExistBySlug(categoryDto.slug);
        }

        const category = await this.#model.create(categoryDto);

        return category;
    }

    async editCategory(id, categoryDto) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(CategoryMessage.IdNotValid);
        const update = await this.checkExistById(id);

        const category = await this.#model.updateOne({ _id: id }, categoryDto);
        if (category.matchedCount === 0) throw new createHttpError.BadRequest(CategoryMessage.Unknown);
    }

    async getTitles() {
        return await this.#model.find({ parent: { $exists: true } }).select("title");
    }

    async searchCategoriesByTitle({ search }) {
        const result = new RegExp(search, "ig");
        return await this.#model.find({ title: result }, {}).select("title slug");
    }

    async checkExistById(id) {
        const category = await this.#model.findById(id);
        if (!category) throw createHttpError.NotFound(CategoryMessage.NotExist);
        return category;
    }

    async checkExistBySlug(slug) {
        const category = await this.#model.findOne({ slug });
        if (!category) throw createHttpError.NotFound(CategoryMessage.NotExist);
        return category;
    }

    async alreadyExistBySlug(slug) {
        const category = await this.#model.findOne({ slug });
        if (category) throw createHttpError.NotFound(CategoryMessage.AlreadyExist);
        return null;
    }

    async getCategoryParents(category) {
        const parents = [
            ...new Set(
                [category._id.toString()]
                    .concat(category.parents.map((id) => id.toString()))
                    .map((id) => new Types.ObjectId(id))
            ),
        ];

        return parents;
    }
}

module.exports = CategoryService;
