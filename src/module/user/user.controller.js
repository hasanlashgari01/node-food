const autoBind = require("auto-bind");
const UserService = require("./user.service");
const UserMessage = require("./user.messages");

class UserController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new UserService();
    }

    async updateProfile(req, res, next) {
        try {
            const { _id: userId } = req.user;

            await this.#service.checkExistUser(userId);
            await this.#service.updateProfile(userId, req.body, req.file);

            res.status(200).json({ message: UserMessage.ProfileUpdateSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeAvatar(req, res, next) {
        try {
            const { _id: userId } = req.user;

            await this.#service.checkExistUser(userId);
            await this.#service.removeAvatar(userId);

            res.status(200).json({ message: UserMessage.ProfileUpdateSuccess });
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(req, res, next) {
        try {
            const { _id: userId } = req.user;

            await this.#service.checkExistUser(userId);
            await this.#service.updatePassword(userId, req.body);

            res.status(200).json({ message: UserMessage.PasswordUpdateSuccess });
        } catch (error) {
            next(error);
        }
    }

    async whoAmI(req, res, next) {
        try {
            const { userResult } = await this.#service.getMe(req.user);

            return res.json(userResult);
        } catch (error) {
            next(error);
        }
    }

    async addCommentRestaurant(req, res, next) {
        try {
            await this.#service.addCommentForRestaurant(req.body, req.user);

            res.status(201).json({ message: UserMessage.CommentCreated });
        } catch (error) {
            next(error);
        }
    }

    async changeRateForRestaurant(req, res, next) {
        try {
            const { id } = req.params;

            const comment = await this.#service.findCommentById(id, "restaurant");
            await this.#service.checkIsUserCreatedComment(comment, req.user);
            await this.#service.changeRateForRestaurant(id, req.body);

            res.status(200).json({ message: UserMessage.CommentEditedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async addCommentFood(req, res, next) {
        try {
            await this.#service.checkExistFood(req.body);
            await this.#service.addCommentForFood(req.body, req.user);

            res.status(201).json({ message: UserMessage.CommentCreated });
        } catch (error) {
            next(error);
        }
    }

    async changeRateForFood(req, res, next) {
        try {
            const { id } = req.params;

            const comment = await this.#service.findCommentById(id, "food");
            await this.#service.checkIsUserCreatedComment(comment, req.user);
            await this.#service.changeRateForFood(id, req.body);

            res.status(200).json({ message: UserMessage.CommentEditedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async likeRestaurant(req, res, next) {
        try {
            await this.#service.checkExistRestaurant(req.params);
            await this.#service.checkIsLikedRestaurant(req.params, req.user, req.method);
            await this.#service.likeRestaurant(req.params, req.user);

            res.status(200).json({ message: UserMessage.LikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeLikeRestaurant(req, res, next) {
        try {
            await this.#service.checkIsLikedRestaurant(req.params, req.user, req.method);
            await this.#service.unlikeRestaurant(req.params, req.user);

            res.status(200).json({ message: UserMessage.UnlikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async bookmarkRestaurant(req, res, next) {
        try {
            await this.#service.checkExistRestaurant(req.params);
            await this.#service.checkIsBookmarkedRestaurant(req.params, req.user, req.method);
            await this.#service.bookmarkRestaurant(req.params, req.user);

            res.status(200).json({ message: UserMessage.BookmarkSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeBookmarkRestaurant(req, res, next) {
        try {
            await this.#service.checkIsBookmarkedRestaurant(req.params, req.user, req.method);
            await this.#service.unbookmarkRestaurant(req.params, req.user);

            res.status(200).json({ message: UserMessage.UnbookmarkSuccess });
        } catch (error) {
            next(error);
        }
    }

    async addLikeRestaurantComment(req, res, next) {
        try {
            const { id } = req.params;
            const comment = await this.#service.findCommentById(id, "restaurant");
            await this.#service.addLikeRestaurantComment(comment, req.user);

            return res.status(200).json({ message: UserMessage.LikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeLikeRestaurantComment(req, res, next) {
        try {
            const { id } = req.params;
            const comment = await this.#service.findCommentById(id, "restaurant");
            await this.#service.removeLikeRestaurantComment(comment, req.user);

            return res.status(200).json({ message: UserMessage.UnlikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async addLikeFoodComment(req, res, next) {
        try {
            const { id } = req.params;
            const comment = await this.#service.findCommentById(id, "food");
            await this.#service.addLikeFoodComment(comment, req.user);

            return res.status(200).json({ message: UserMessage.LikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeLikeFoodComment(req, res, next) {
        try {
            const { id } = req.params;
            const comment = await this.#service.findCommentById(id, "food");
            await this.#service.removeLikeFoodComment(comment, req.user);

            return res.status(200).json({ message: UserMessage.UnlikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async likeFood(req, res, next) {
        try {
            await this.#service.checkExistFood(req.params);
            await this.#service.checkIsLikedFood(req.params, req.user, req.method);
            await this.#service.likeFood(req.params, req.user);

            res.status(200).json({ message: UserMessage.LikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeLikeFood(req, res, next) {
        try {
            await this.#service.checkIsLikedFood(req.params, req.user, req.method);
            await this.#service.unlikeFood(req.params, req.user);

            res.status(200).json({ message: UserMessage.UnlikeSuccess });
        } catch (error) {
            next(error);
        }
    }

    async bookmarkFood(req, res, next) {
        try {
            await this.#service.checkExistFood(req.params);
            await this.#service.checkIsBookmarkedFood(req.params, req.user, req.method);
            await this.#service.bookmarkFood(req.params, req.user);

            res.status(200).json({ message: UserMessage.BookmarkSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeBookmarkFood(req, res, next) {
        try {
            await this.#service.checkIsBookmarkedFood(req.params, req.user, req.method);
            await this.#service.unbookmarkFood(req.params, req.user);

            res.status(200).json({ message: UserMessage.UnbookmarkSuccess });
        } catch (error) {
            next(error);
        }
    }

    // * Cart
    async getCart(req, res, next) {
        try {
            const cart = await this.#service.getCart(req.user);

            res.status(200).json(cart);
        } catch (error) {
            next(error);
        }
    }

    async removeFoodFromCart(req, res, next) {
        try {
            await this.#service.checkIsFoodInCart(req.user, req.params);
            await this.#service.removeFoodFromCart(req.user, req.params);

            res.status(200).json({ message: UserMessage.RemoveFoodFromCartSuccess });
        } catch (error) {
            next(error);
        }
    }

    async incrementCart(req, res, next) {
        try {
            const result = await this.#service.checkIsFoodInCart(req.user, req.body);
            await this.#service.incrementCart(req.user, req.body, result);

            res.json({ message: UserMessage.IncrementCartSuccess });
        } catch (error) {
            next(error);
        }
    }

    async decrementCart(req, res, next) {
        try {
            const result = await this.#service.checkIsFoodInCart(req.user, req.body);
            await this.#service.decrementCart(req.user, req.body, result);

            res.json({ message: UserMessage.DecrementCartSuccess });
        } catch (error) {
            next(error);
        }
    }

    async emptyCart(req, res, next) {
        try {
            await this.#service.emptyCart(req.user);

            res.json({ message: UserMessage.EmptyCartSuccess });
        } catch (error) {
            next(error);
        }
    }

    // * Address

    async getAllAddress(req, res, next) {
        try {
            const result = await this.#service.getAllAddress(req.user);

            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    async addAddress(req, res, next) {
        try {
            await this.#service.addAddress(req.user, req.body);

            res.status(201).json({ message: UserMessage.AddressAdded });
        } catch (error) {
            next(error);
        }
    }

    async getAddress(req, res, next) {
        try {
            const result = await this.#service.getAddress(req.user, req.params);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async editAddress(req, res, next) {
        try {
            await this.#service.editAddress(req.user, req.params, req.body);

            res.status(200).json({ message: UserMessage.AddressEdited });
        } catch (error) {
            next(error);
        }
    }

    async removeAddress(req, res, next) {
        try {
            await this.#service.removeAddress(req.user, req.params);

            res.status(201).json({ message: UserMessage.AddressRemoved });
        } catch (error) {
            next(error);
        }
    }

    // * Comments
    async getComments(req, res, next) {
        try {
            const { foodComments, restaurantComments } = await this.#service.getComments(req.user);

            res.status(200).json([...foodComments, ...restaurantComments]);
        } catch (error) {
            next(error);
        }
    }

    // * Offers
    async getOffers(req, res, next) {
        try {
            const { offers } = await this.#service.getOffers(req.user);

            res.status(200).json(offers);
        } catch (error) {
            next(error);
        }
    }

    async getDashboard(req, res, next) {
        try {
            const result = await this.#service.getDashboard(req.user);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
