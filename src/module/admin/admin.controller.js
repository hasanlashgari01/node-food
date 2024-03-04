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

    async getAllRestaurantWithStatus(req, res, next) {
        try {
            const { isValid } = req.params;
            const { restaurantCount, restaurants } = await this.#service.allRestaurantWithStatus(isValid);

            res.json({ count: restaurantCount, restaurants });
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

            res.json({
                message: isValid ? AdminMessage.RestaurantRejectSuccess : AdminMessage.RestaurantAcceptSuccess,
            });
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
            await this.#service.checkIsBanRestaurant(id);
            const restaurant = await this.#service.checkIsValidRestaurant(id);

            res.json(restaurant);
        } catch (error) {
            next(error);
        }
    }

    // Suggestion Menu
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

    // Users
    async getAllUsers(req, res, next) {
        try {
            const { resultCount: usersCount, result: users } = await this.#service.allUsersByRole("USER");

            res.json({ count: usersCount, users });
        } catch (error) {
            next(error);
        }
    }

    async getAllSellers(req, res, next) {
        try {
            const { resultCount: sellersCount, result: sellers } = await this.#service.allUsersByRole("SELLER");

            res.json({ count: sellersCount, sellers });
        } catch (error) {}
    }

    async banUser(req, res, next) {
        try {
            const { id } = req.params;
            const { mobile, email } = await this.#service.checkIsValidUser(id);
            const isBanUser = await this.#service.checkIsUserOnBanList(mobile, email);
            const banResult = await this.#service.banUserByAdmin(mobile, email, isBanUser);

            res.status(banResult.deletedCount ? 200 : 201).json({
                message: banResult.deletedCount ? AdminMessage.UserUnBanSuccess : AdminMessage.UserBanSuccess,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsersByRole(req, res, next) {
        try {
            const { role } = req.params;
            const { result } = await this.#service.getUsersByRole(role);

            res.json({ count: result.length, result });
        } catch (error) {
            next(error);
        }
    }

    async getUsersBanned(req, res, next) {
        try {
            const { result } = await this.#service.getUsersBanned();

            res.json({ count: result.length, result });
        } catch (error) {
            next(error);
        }
    }

    async acceptAsSeller(req, res, next) {
        try {
            const { id } = req.params;
            const { mobile, email } = await this.#service.checkIsValidUser(id);
            const isBanUser = await this.#service.checkIsUserOnBanList(mobile, email);
            await this.#service.userBanListGuard(isBanUser);
            await this.#service.changeRoleAsSeller(id);

            res.json({ message: AdminMessage.UserChangeRoleSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getRestaurantComments(req, res, next) {
        try {
            const comments = await this.#service.getRestaurantComments();

            res.json({ count: comments.length, comments });
        } catch (error) {
            next(error);
        }
    }

    async rejectCommentAndBanUser(req, res, next) {
        try {
            const { id: commentId } = req.params;
            const { _id: authorId } = await this.#service.rejectRestaurantComment(commentId);
            const { mobile, email } = await this.#service.checkIsValidUser(authorId);
            const result = await this.#service.banUserByAdmin(mobile, email, false);

            res.json({ message: AdminMessage.UserBanSuccess });
        } catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                const message = `An item with the same ${field} already exists.`;
                return res.status(409).json({ error: message });
            }
            next(error);
        }
    }
}

module.exports = AdminController;
