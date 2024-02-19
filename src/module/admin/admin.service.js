const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const UserModel = require("../user/user.schema");
const AdminMessage = require("./admin.messages");

class AuthService {
    #model;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
    }
}

module.exports = AuthService;
