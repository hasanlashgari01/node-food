const AuthorizationMessage = Object.freeze({
    Login: "وارد حساب کاربری خود شوید",
    LoginAgain: "لطفا دوباره وارد حساب کاربری خود شوید",
    Unauthorized: "شما اجازه دسترسی ندارید ابتدا وارد حساب کاربری خود شوید",
    NotFoundUser: "کاربری یافت نشد",
    InvalidToken: "توکن اشتباه است",
    ExpiredToken: "توکن منقضی شده است",
});

module.exports = AuthorizationMessage;
