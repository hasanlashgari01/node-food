import UserModel from "./user.schema";

class UserService {
    #model;
    constructor() {
        this.#model = UserModel;
    }
}

export default UserService;
