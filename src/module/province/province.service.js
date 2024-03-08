const createHttpError = require("http-errors");
const ProvinceModel = require("./province.schema");
const ProvinceMessage = require("./province.messages");

class ProvinceService {
    #model;

    constructor() {
        this.#model = ProvinceModel;
    }

    async getAll() {
        return await this.#model.find({}).select("-__v").sort({ name: 1 }).lean();
    }

    async create(bodyDto) {
        const { name, englishTitle } = bodyDto;
        if (!name || !englishTitle) throw new createHttpError.BadRequest(ProvinceMessage.FieldsNotEmpty);

        await this.checkExistByEnglishTitle(englishTitle);
        const result = await this.#model.create({ name, englishTitle });
        if (!result) throw new createHttpError.InternalServerError(ProvinceMessage.CreatedFailed);
    }

    async createMany(bodyDto) {
        if (!bodyDto.length) throw new createHttpError.BadRequest(ProvinceMessage.FieldsNotEmpty);
        const result = await this.#model.insertMany(bodyDto);
        if (!result) throw new createHttpError.InternalServerError(ProvinceMessage.CreatedFailed);
    }

    async checkExistByEnglishTitle(englishTitle) {
        const isExist = await this.#model.findOne({ englishTitle });
        if (isExist) throw new createHttpError.BadRequest(ProvinceMessage.AlreadyExist);
    }
}

module.exports = ProvinceService;
