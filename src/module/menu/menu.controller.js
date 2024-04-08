const autoBind = require("auto-bind");
const MenuService = require("./menu.service");
const MenuMessage = require("./menu.messages");

class MenuController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new MenuService();
    }

    async create(req, res, next) {
        try {
            const { restaurantId } = req.body;
            const userDto = req.user;
            await this.#service.isValidRestaurant(restaurantId);
            await this.#service.isRestaurantAdmin(restaurantId, userDto);
            await this.#service.create(req.body, userDto, req.file);
            res.status(201).json({ message: MenuMessage.CreatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            
            await this.#service.update(id, req.body);

            res.json({ message: MenuMessage.EditSuccess });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const { restaurantId } = await this.#service.isValidMenu(id);
            await this.#service.checkIsBanRestaurant(restaurantId);
            await this.#service.isValidRestaurant(restaurantId);
            await this.#service.isRestaurantAdmin(restaurantId, req.user);
            await this.#service.delete(id, req.user);

            res.json({ message: MenuMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getMenuBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const menu = await this.#service.getMenuBySlug(slug);

            res.json(menu);
        } catch (error) {
            next(error);
        }
    }

    async getMenuById(req, res, next) {
        try {
            const { id } = req.params;
            const menu = await this.#service.getMenuById(id);

            res.json(menu);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MenuController;
