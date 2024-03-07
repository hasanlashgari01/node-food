const { isValidObjectId } = require("mongoose");
const createHttpError = require("http-errors");
const OrderModel = require("./order.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const OrderMessage = require("./order.messages");
const CouponModel = require("../coupon/coupon.schema");
const UserModel = require("../user/user.schema");
const KindOfFoodModel = require("../food/food-kind.schema");

class OrderService {
    #model;
    #restaurantModel;
    #couponModel;
    #userModel;
    #kindFoodModel;
    constructor() {
        this.#model = OrderModel;
        this.#restaurantModel = RestaurantModel;
        this.#couponModel = CouponModel;
        this.#userModel = UserModel;
        this.#kindFoodModel = KindOfFoodModel;
    }

    async create(bodyDto, userDto) {
        const { _id: userId } = userDto;
        const { province, address, payment, paymentDate, coupon } = bodyDto;

        const { cart: cartDto } = await this.#userModel.findById(userId, "cart").populate("cart.foods.foodId");
        if (!cartDto) throw createHttpError.NotFound(OrderMessage.NotExistCart);
        const totalPrice = await this.calculateTotal(cartDto.foods);
        const foods = cartDto.foods.map((food) => food.foodId);
        const couponResult = await this.checkExistCoupon(coupon);
        await this.checkCouponForUser(userId, couponResult);

        const order = await this.#model.create({
            user: userId,
            foods: foods,
            total: totalPrice,
            province,
            address,
            payment,
            paymentDate,
            coupon: couponResult?.code ?? null,
            couponAmount: couponResult?.amount ?? null,
            orderDate: Date.now(),
        });
        return order;
    }

    async getAll(userDto) {
        const { _id: userId } = userDto;

        return await this.#model.find({ user: userId }, "-__v").populate("foods", "-__v -restaurantId -foodId").lean();
    }

    async payOrder(orderDto, userDto) {
        const { id: orderId } = orderDto;
        const { _id: userId } = userDto;

        const validOrder = await this.checkValidOrder(orderId, userId);
        await this.checkIsPayment(validOrder);
        const result = await this.#model.updateOne(
            { _id: orderId, user: userId },
            { status: "PENDING", paymentStatus: "PAID", paymentDate: Date.now() }
        );
        if (!result.modifiedCount) throw createHttpError.BadRequest(OrderMessage.PaymentFailed);
    }

    async cancelOrder(orderDto, userDto) {
        const { id: orderId } = orderDto;
        const { _id: userId } = userDto;

        const validOrder = await this.checkValidOrder(orderId, userId);
        await this.checkIsPayment(validOrder);
        await this.checkIsCancel(validOrder);

        const result = await this.#model.updateOne(
            { _id: orderId, user: userId },
            { status: "CANCELED", deliveryStatus: "CANCELED", cancelDate: Date.now() }
        );
        if (!result.modifiedCount) throw createHttpError.BadRequest(OrderMessage.OrderCancelFailed);
    }

    async getAllOrders(restaurantDto, queryDto) {
        const { id: restaurantId } = restaurantDto;

        const restaurant = await this.#restaurantModel.findById(restaurantId).select("_id").lean();
        const kindFoods = await this.#kindFoodModel.find({ restaurantId: restaurant._id }).select("_id").lean();
        const queryResult = await this.checkQueryIsValid(queryDto);
        let orders = [];
        if (Object.keys(queryDto).length > 0) {
            orders = await this.#model
                .find({
                    foods: { $in: kindFoods },
                    $or: [{ ...queryResult }],
                })
                .select("-__v")
                .populate("user", "fullName mobile")
                .populate("foods", "-__v -restaurantId -foodId")
                .lean();
        } else {
            orders = await this.#model
                .find({ foods: { $in: kindFoods } }, "-__v")
                .populate("user", "fullName mobile")
                .populate("foods", "-__v -restaurantId -foodId")
                .lean();
        }
        return orders;
    }

    async getOrder(orderDto) {
        const { orderId } = orderDto;

        return await this.checkValidOrder(false, orderId);
    }

    async getAllOrdersByAdmin(queryDto) {
        const queryResult = await this.checkQueryIsValid(queryDto);
        let orders = [];
        if (Object.keys(queryDto).length > 0) {
            orders = await this.#model
                .find({ $or: [{ ...queryResult }] })
                .select("-__v")
                .populate("user", "fullName mobile")
                .populate("foods", "-__v -restaurantId -foodId")
                .lean();
        } else {
            orders = await this.#model
                .find({}, "-__v")
                .populate("user", "fullName mobile")
                .populate("foods", "-__v -restaurantId -foodId")
                .lean();
        }
        return orders;
    }

    async checkExistCoupon(code) {
        if (!code) return;
        const coupon = await this.#couponModel.findOne({ code, status: "active" });
        if (!coupon) throw createHttpError.NotFound(OrderMessage.NotExistCoupon);
        const { startDate, expireDate, usageCount } = coupon;
        if (startDate > Date.now() || expireDate < Date.now() || usageCount <= 0) {
            throw createHttpError.NotFound(OrderMessage.NotExistCoupon);
        }

        return coupon;
    }

    async checkCouponForUser(userId, couponDto) {
        if (!couponDto) return;
        if (couponDto.userIds.length >= 1 && !couponDto.userIds.includes(userId))
            throw createHttpError.NotFound(OrderMessage.NotExistCoupon);
    }

    async calculateTotal(foods) {
        const foodWithDiscount = foods.map((food) => {
            const { foodId, quantity } = food;
            const { percent, startDate, endDate } = foodId.discount;
            if (startDate > Date.now() || endDate < Date.now()) percent = 0;
            const calcPriceQuantity = foodId.price * quantity;
            const priceWithDiscount = (calcPriceQuantity * (100 - percent)) / 100;
            return priceWithDiscount;
        });
        const total = foodWithDiscount.reduce((acc, cur) => acc + cur, 0);
        return total;
    }

    async allUsersHaveNotOrder() {
        const orders = await this.#model.find().select("user").lean();
        const usersHaveOrder = orders.map((order) => order.user);
        const users = await this.#userModel
            .find({ _id: { $nin: usersHaveOrder } })
            .select("fullName mobile email")
            .lean();

        return users;
    }

    async checkValidOrder(checkAdminRestaurant = true, orderId, userId) {
        if (!isValidObjectId(orderId) && !isValidObjectId(userId))
            throw createHttpError.Conflict(OrderMessage.IdNotValid);
        let order = null;
        if (!checkAdminRestaurant) {
            order = await this.#model
                .findOne({ _id: orderId }, "-__v")
                .populate("user", "fullName mobile")
                .populate("foods", "-__v -restaurantId -foodId")
                .lean();
        } else {
            order = await this.#model.findOne({ _id: orderId, user: userId }).lean();
        }
        if (!order) throw createHttpError.NotFound(OrderMessage.NotExist);
        return order;
    }

    async checkIsPayment(orderDto) {
        if (orderDto.status === "CANCELED" || orderDto.deliveryStatus === "CANCELED")
            throw createHttpError.BadRequest(OrderMessage.OrderCanceled);
        if (orderDto.paymentStatus === "PAID") throw createHttpError.BadRequest(OrderMessage.OrderPaid);
    }

    async checkIsDelivered(orderDto) {
        if (orderDto.deliveryStatus === "COMPLETED") throw createHttpError.BadRequest(OrderMessage.OrderDelivered);
    }

    async checkQueryIsValid(queryDto) {
        Object.keys(queryDto).forEach((key) => !queryDto[key] && delete queryDto[key]);
        const { status, payment, paymentStatus, deliveryStatus } = queryDto;
        const validStatus = ["COMPLETED", "PENDING", "CANCELED"];
        const validPayment = ["CASH_ON_DELIVERY", "ONLINE"];
        const validPaymentStatus = ["PAID", "UNPAID"];

        if (status && !validStatus.includes(status)) throw createHttpError.BadRequest(OrderMessage.StatusNotValid);
        if (payment && !validPayment.includes(payment)) throw createHttpError.BadRequest(OrderMessage.PaymentNotValid);
        if (paymentStatus && !validPaymentStatus.includes(payment))
            throw createHttpError.BadRequest(OrderMessage.PaymentStatusNotValid);
        if (deliveryStatus && !validStatus.includes(deliveryStatus))
            throw createHttpError.BadRequest(OrderMessage.DeliveryStatusNotValid);

        return queryDto;
    }
}

module.exports = OrderService;
