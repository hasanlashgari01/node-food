const RestaurantModel = require("./restaurant.schema");

class RestaurantService {
    #model;
    constructor() {
        this.#model = RestaurantModel;
    }
}

module.exports = RestaurantService;
