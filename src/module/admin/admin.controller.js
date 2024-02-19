const autoBind = require("auto-bind");
const AdminService = require("./admin.service");
const AdminMessage = require("./admin.messages");

class AdminController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new AdminService();
    }

    async getAllRestaurant(req, res, next) {
        try {
            const { restaurantCount, restaurants } = await this.#service.allRestaurant();

            res.json({ count: restaurantCount, restaurants });
        } catch (error) {
            next(error);
        }
    }

    async getRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            const restaurant = await this.#service.getRestaurant(id);

            res.json(restaurant);
        } catch (error) {
            next(error);
        }
    }

    async changeRestaurantValid(req, res, next) {
        try {
            const { id } = req.params;
            const { isValid } = await this.#service.AcceptOrRejectRestaurant(id);

            res.json({ message: isValid ? AdminMessage.RestaurantRejectSuccess : AdminMessage.RestaurantAcceptSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;
