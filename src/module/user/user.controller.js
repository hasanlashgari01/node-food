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
            return res.json(req.user);
        } catch (error) {
            next(error);
        }
    }

    async createComment(req, res, next) {
        try {
            await this.#service.addCommentForRestaurant(req.body, req.user);

            res.status(201).json({ message: "Comment created successfully" });
        } catch (error) {
            next(error);
        }
    }

    async changeRateForRestaurant(req, res, next) {
        try {
            const { id } = req.params;

            const comment = await this.#service.findCommentById(id);
            await this.#service.checkIsUserCreatedComment(comment, req.user);
            await this.#service.changeRateForRestaurant(id, req.body);

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
}

module.exports = UserController;
