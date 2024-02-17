const router = require("express").Router();
const { AuthRouter } = require("./module/auth/auth.routes");
const { UserRouter } = require("./module/user/user.routes");
const { CategoryRouter } = require("./module/category/category.routes");
const { RestaurantRouter } = require("./module/restaurant/restaurant.routes");

router.use("/auth", AuthRouter);
router.use("/user", UserRouter);
router.use("/category", CategoryRouter);
router.use("/restaurant", RestaurantRouter);

module.exports = router;
