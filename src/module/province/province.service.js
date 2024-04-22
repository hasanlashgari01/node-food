const createHttpError = require("http-errors");
const ProvinceModel = require("./province.schema");
const ProvinceMessage = require("./province.messages");
const { isValidObjectId } = require("mongoose");

class ProvinceService {
    #model;

    constructor() {
        this.#model = ProvinceModel;
    }

    async getAll() {
        return await this.#model.find({}).select("-__v").sort({ name: 1 }).lean();
    }

    async getListProvince(queryDto) {
        return await this.#model.find({}).select("-__v").sort({ name: 1 }).lean();
    }

    async create(bodyDto) {
        const { name, englishTitle } = bodyDto;
        if (!name && !englishTitle) throw new createHttpError.BadRequest(ProvinceMessage.FieldsNotEmpty);

        await this.checkExistByEnglishTitle(englishTitle);
        const result = await this.#model.create({ name, englishTitle: englishTitle.toLowerCase() });
        if (!result) throw new createHttpError.InternalServerError(ProvinceMessage.CreatedFailed);
    }

    async createMany(bodyDto) {
        if (!bodyDto.length) throw new createHttpError.BadRequest(ProvinceMessage.FieldsNotEmpty);
        const result = await this.#model.insertMany(bodyDto);
        if (!result) throw new createHttpError.InternalServerError(ProvinceMessage.CreatedFailed);
    }

    async getOne(paramsDto) {
        const { id: provinceId } = paramsDto;

        await this.checkValidId(provinceId);

        const province = await this.#model.findById(provinceId).select("-__v").lean();
        if (!province) return new createHttpError.InternalServerError(ProvinceMessage.NotFound);

        return province;
    }

    async update(paramsDto, bodyDto) {
        const { id: provinceId } = paramsDto;
        const { name, englishTitle } = bodyDto;

        await this.checkValidId(provinceId);
        if (name === "" || englishTitle === "") throw new createHttpError.BadRequest(ProvinceMessage.FieldsNotEmpty);
        // if (englishTitle !== "") await this.checkExistByEnglishTitle(englishTitle);
        const result = await this.#model.updateOne({ _id: provinceId }, { name, englishTitle });
        if (!result || result.modifiedCount === 0)
            throw new createHttpError.InternalServerError(ProvinceMessage.EditFailed);
    }

    async delete(paramsDto) {
        const { id: provinceId } = paramsDto;
        await this.checkValidId(provinceId);

        const result = await this.#model.deleteOne({ _id: provinceId });
        if (!result) throw new createHttpError.InternalServerError(ProvinceMessage.DeleteFailed);
    }

    async deleteMany(bodyDto) {
        const { provinceIds } = bodyDto;

        const result = await this.#model.deleteMany({ _id: { $in: provinceIds } });
        if (!result || result.deletedCount === 0)
            throw new createHttpError.InternalServerError(ProvinceMessage.DeleteFailed);
    }

    async checkExistByEnglishTitle(englishTitle) {
        const isExist = await this.#model.findOne({ englishTitle });
        if (isExist) throw new createHttpError.BadRequest(ProvinceMessage.AlreadyExist);
    }

    async checkValidId(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(ProvinceMessage.IdNotValid);
    }
}

module.exports = ProvinceService;
