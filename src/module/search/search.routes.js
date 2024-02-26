const router = require("express").Router();
const SearchController = require("./search.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new SearchController();

router.get("/restaurant", controller.searchRestaurant);
router.use(AccessTokenGuard, RefreshTokenGuard);
router.get("/admin/users", controller.searchUser);

module.exports = { SearchRouter: router };
