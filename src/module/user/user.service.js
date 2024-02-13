const UserModel = require("./user.schema");

class UserService {
    #model;
    constructor() {
        this.#model = UserModel;
    }
}

module.exports = UserService;
