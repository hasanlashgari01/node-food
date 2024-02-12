interface AuthorizationMessageType {
    Login: string;
    LoginAgain: string;
    Unauthorized: string;
    NotFoundUser: string;
    InvalidToken: string;
}

const AuthorizationMessage: AuthorizationMessageType = Object.freeze({
    Login: "وارد حساب کاربری خود شوید",
    LoginAgain: "لطفا دوباره وارد حساب کاربری خود شوید",
    Unauthorized: "شما اجازه دسترسی ندارید ابتدا وارد حساب کاربری خود شوید",
    NotFoundUser: "کاربری یافت نشد",
    InvalidToken: "توکن اشتباه است",
});

export default AuthorizationMessage;
