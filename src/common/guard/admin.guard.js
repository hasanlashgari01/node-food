const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const UserModel = require("../../module/user/user.schema");
const { AdminMessage } = require("../messages/admin.message");

const isAdminGuard = async (req, res, next) => {
    try {
        if (req.user.role !== "ADMIN") throw createHttpError.MethodNotAllowed(AdminMessage.NotAccess)

        return next();
    } catch (error) {
        next(error);
    }
};

module.exports = { isAdminGuard };