const router = require("express").Router();
const { AuthRouter } = require("./module/auth/auth.routes");
const { UserRouter } = require("./module/user/user.routes");
const { AccessTokenGuard, RefreshTokenGuard } = require("./common/guard/auth.guard");

router.use("/auth", AuthRouter);
router.use(AccessTokenGuard, RefreshTokenGuard)
router.use("/user", UserRouter);

module.exports = router;
