const autoBind = require("auto-bind");
const UserService = require("./user.service");
const UserMessage = require("./user.messages");

class UserController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new UserService();
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
}

module.exports = UserController;
