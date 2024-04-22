const autoBind = require("auto-bind");
const RestaurantService = require("./restaurant.service");
const RestaurantMessage = require("./restaurant.messages");

class RestaurantController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new RestaurantService();
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body, req.user);
            res.status(201).json({ message: RestaurantMessage.CreatedSuccess });
        } catch (error) {
            const field = Object.keys(error.keyPattern);
            if (field[0] === "slug") error.message = RestaurantMessage.AlreadyExist;
            if (field[0] === "phone") error.message = RestaurantMessage.AlreadyExist;
            if (field[0] === "email") error.message = RestaurantMessage.AlreadyExist;

            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const { restaurant, menu } = await this.#service.getOne(id);

            res.json({ restaurant, menu });
        } catch (error) {
            next(error);
        }
    }

    async toggleLike(req, res, next) {
        try {
            const { message } = await this.#service.toggleLike(req.params, req.user);

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }

    async toggleBookmark(req, res, next) {
        try {
            const { message } = await this.#service.toggleBookmark(req.params, req.user);

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.update(id, req.body, req.user);

            res.json({ message: RestaurantMessage.EditSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getRestaurantBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const restaurant = await this.#service.getRestaurantBySlug(slug, req.user);

            res.json(restaurant);
        } catch (error) {
            next(error);
        }
    }

    async getMenusByAdmin(req, res, next) {
        try {
            const { id } = req.params;
            const { menus } = await this.#service.getMenusByAdmin(id);

            res.json({ count: menus.length, menus });
        } catch (error) {
            next(error);
        }
    }

    async getMenusEmpty(req, res, next) {
        try {
            const { id } = req.params;
            const { menus } = await this.#service.getMenusEmpty(id);

            res.json({ count: menus.length, menus });
        } catch (error) {
            next(error);
        }
    }

    async getCommentsByAdmin(req, res, next) {
        try {
            const { id } = req.params;
            const { comments } = await this.#service.getCommentsByAdmin(id, req.user);

            res.json({ count: comments.length, comments });
        } catch (error) {
            next(error);
        }
    }

    async getComments(req, res, next) {
        try {
            const { id } = req.params;
            const { count, comments } = await this.#service.getComments(id, req.user, req.query);

            res.json({ count, comments });
        } catch (error) {
            next(error);
        }
    }

    async getCommentById(req, res, next) {
        try {
            const comment = await this.#service.getCommentById(req.params);

            res.json(comment);
        } catch (error) {
            next(error);
        }
    }

    async createComment(req, res, next) {
        try {
            await this.#service.createComment(req.body, req.user);

            res.json({ message: RestaurantMessage.CommentCreatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async toggleLikeComment(req, res, next) {
        try {
            const { message } = await this.#service.toggleLikeComment(req.params, req.user);

            res.json({ message });
        } catch (error) {
            next(error);
        }
    }

    async getPopularRestaurants(req, res, next) {
        try {
            const restaurants = await this.#service.getPopularRestaurants(req.query);

            res.json(restaurants);
        } catch (error) {
            next(error);
        }
    }

    async getNewsRestaurants(req, res, next) {
        try {
            const foods = await this.#service.getNewsRestaurants(req.query);

            res.json(foods);
        } catch (error) {
            console.log("🚀 ~ RestaurantController ~ getNewsRestaurants ~ error:", error);
            next(error);
        }
    }

    async getSuggestionSimilarById(req, res, next) {
        try {
            const { id } = req.params;
            const restaurants = await this.#service.getSuggestionSimilarById(id, req.query);

            res.json(restaurants);
        } catch (error) {
            next(error);
        }
    }

    async getSuggestionPopularById(req, res, next) {
        try {
            const { id } = req.params;
            const restaurants = await this.#service.getSuggestionPopularById(id, req.query);

            res.json(restaurants);
        } catch (error) {
            next(error);
        }
    }

    async getNews(req, res, next) {
        try {
            const { id } = req.params;
            const foods = await this.#service.getNews(id, req.query);

            res.json(foods);
        } catch (error) {
            next(error);
        }
    }

    async changeCommentStatus(req, res, next) {
        try {
            const { id } = req.params;

            const { comment } = await this.#service.checkExistComment(id);
            await this.#service.changeCommentStatus(comment);

            res.json({ message: RestaurantMessage.CommentUpdateSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getAllFoods(req, res, next) {
        try {
            const { id } = req.params;
            const menus = await this.#service.getMenusId(id);
            const { foods } = await this.#service.getAllFoods(menus);

            res.json({ count: foods.length, foods });
        } catch (error) {
            next(error);
        }
    }

    async getAllFoodsHaveDiscount(req, res, next) {
        try {
            const { id } = req.params;
            const { foods } = await this.#service.getAllFoodsHaveDiscount(id);

            res.json({ count: foods.length, foods });
        } catch (error) {
            next(error);
        }
    }

    async applyDiscountToAllFoods(req, res, next) {
        try {
            await this.#service.applyDiscountToAllFoods(req.params, req.body);

            res.json({ message: RestaurantMessage.ApplyDiscountSuccess });
        } catch (error) {
            next(error);
        }
    }

    async changeDiscountToAllFoods(req, res, next) {
        try {
            await this.#service.changeDiscountToAllFoods(req.params, req.body);

            res.json({ message: RestaurantMessage.ApplyDiscountSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeDiscountToAllFoods(req, res, next) {
        try {
            await this.#service.removeDiscountToAllFoods(req.params, req.body);

            res.json({ message: RestaurantMessage.DiscountRemovedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async applyDiscountFoods(req, res, next) {
        try {
            console.log(req.body);
            await this.#service.applyDiscountFoods(req.params, req.body);

            res.json({ message: RestaurantMessage.ApplyDiscountSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeDiscountFoods(req, res, next) {
        try {
            await this.#service.removeDiscountFoods(req.params, req.body);

            res.json({ message: RestaurantMessage.DiscountRemovedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async uploadLogo(req, res, next) {
        try {
            await this.#service.uploadLogo(req.params, req.file);

            res.json({ message: RestaurantMessage.UploadImageSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeLogo(req, res, next) {
        try {
            await this.#service.removeLogo(req.params);

            res.json({ message: RestaurantMessage.DeleteImageSuccess });
        } catch (error) {
            next(error);
        }
    }

    async uploadCover(req, res, next) {
        try {
            await this.#service.uploadCover(req.params, req.file);

            res.json({ message: RestaurantMessage.UploadImageSuccess });
        } catch (error) {
            next(error);
        }
    }

    async removeCover(req, res, next) {
        try {
            await this.#service.removeCover(req.params);

            res.json({ message: RestaurantMessage.DeleteImageSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantController;
