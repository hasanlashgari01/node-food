const autoBind = require("auto-bind");
const UserService = require("./user.service");

class UserController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new UserService();
    }

    async whoAmI(req, res, next) {
        try {
            return res.json(req.user);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
