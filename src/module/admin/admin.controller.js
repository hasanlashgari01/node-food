const autoBind = require("auto-bind");
const AdminService = require("./admin.service");
const AdminMessage = require("./admin.messages");

class AdminController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new AdminService();
    }

    async test(req, res, next) {
        try {
            res.json({ message: "ok" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;
