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

    async getAllRestaurantBanned(req, res, next) {
        try {
            const { restaurantBannedCount, restaurantsBanned } = await this.#service.allRestaurantBanned();

            res.json({ count: restaurantBannedCount, restaurantsBanned });
        } catch (error) {
            next(error);
        }
    }

    async changeRestaurantValid(req, res, next) {
        try {
            const { id } = req.params;
            const { isValid } = await this.#service.checkIsValidRestaurant(id);
            await this.#service.checkIsBanRestaurant(id);
            await this.#service.acceptOrRejectRestaurant(id, isValid);

            res.json({ message: isValid ? AdminMessage.RestaurantRejectSuccess : AdminMessage.RestaurantAcceptSuccess });
        } catch (error) {
            next(error);
        }
    }

    async banRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.checkIsValidRestaurant(id);
            await this.#service.checkIsBanRestaurant(id);
            await this.#service.banRestaurant(id);

            res.json({ message: AdminMessage.RestaurantBanSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeRestaurantBan(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.checkIsValidRestaurant(id);
            await this.#service.checkIsNotBanRestaurant(id);
            await this.#service.removeRestaurantBan(id);

            res.json({ message: AdminMessage.RestaurantRemoveBanSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getRestaurant(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.checkIsValidRestaurant(id);
            const restaurant = await this.#service.getRestaurant(id);

            res.json(restaurant);
        } catch (error) {
            next(error);
        }
    }

    // Menu
    async createSuggestionMenu(req, res, next) {
        try {
            const { title, slug } = req.body;
            await this.#service.checkAlreadySuggestionMenu(title, slug, req.file);
            await this.#service.createSuggestionMenu(req.body, req.file);

            res.status(201).json({ message: AdminMessage.SuggestionMenuCreateSuccess });
        } catch (error) {
            next(error);
        }
    }

    async editSuggestionMenu(req, res, next) {
        try {
            const { id } = req.params;
            const { title, slug } = req.body;
            await this.#service.checkIsValidSuggestionMenu(id);
            await this.#service.checkAlreadySuggestionMenu(title, slug, req.file);
            await this.#service.editSuggestionMenu(id, req.body, req.file);

            res.json({ message: AdminMessage.SuggestionMenuEditSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeSuggestionMenu(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.checkIsValidSuggestionMenu(id);
            await this.#service.removeSuggestionMenu(id);

            res.json({ message: AdminMessage.SuggestionMenuRemoveSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getAllSuggestionMenu(req, res, next) {
        try {
            const { suggestionMenuCount, suggestionMenus } = await this.#service.allSuggestionMenu();

            res.json({ count: suggestionMenuCount, suggestionMenus });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = AdminController;
