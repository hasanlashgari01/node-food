const router = require("express").Router();
const { AuthRouter } = require("./module/auth/auth.routes");
const { UserRouter } = require("./module/user/user.routes");
const { CategoryRouter } = require("./module/category/category.routes");
const { RestaurantRouter } = require("./module/restaurant/restaurant.routes");
const { MenuRouter } = require("./module/menu/menu.routes");
const { AccessTokenGuard, RefreshTokenGuard } = require("./common/guard/auth.guard");

router.use("/auth", AuthRouter);
router.use("/category", CategoryRouter);

router.use(AccessTokenGuard, RefreshTokenGuard);
router.use("/user", UserRouter);
router.use("/restaurant", RestaurantRouter);
router.use("/menu", MenuRouter);

module.exports = router;
