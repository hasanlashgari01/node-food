const router = require("express").Router();
const { AuthRouter } = require("./module/auth/auth.routes");
const { UserRouter } = require("./module/user/user.routes");
const { CategoryRouter } = require("./module/category/category.routes");
const { RestaurantRouter } = require("./module/restaurant/restaurant.routes");
const { MenuRouter } = require("./module/menu/menu.routes");
const { FoodRouter } = require("./module/food/food.routes");
const { FilesRouter } = require("./module/files/files.routes");
const { AdminRouter } = require("./module/admin/admin.routes");
const { SearchRouter } = require("./module/search/search.routes");
const { CouponRouter } = require("./module/coupon/coupon.routes");
const { OrderRouter } = require("./module/order/order.routes");
const { HomeRouter } = require("./module/home/home.routes");
const { ProvinceRouter } = require("./module/province/province.routes");

router.use("/files", FilesRouter);
router.use("/auth", AuthRouter);
router.use("/admin", AdminRouter);
router.use("/category", CategoryRouter);
router.use("/search", SearchRouter);

router.use("/api/home", HomeRouter);
router.use("/api/user", UserRouter);
router.use("/api/restaurant", RestaurantRouter);
router.use("/api/menu", MenuRouter);
router.use("/api/food", FoodRouter);
router.use("/api/coupon", CouponRouter);
router.use("/api/order", OrderRouter);
router.use("/api/province", ProvinceRouter);

module.exports = router;
