interface AuthMessageType {
    SendOtpSuccessfully: string;
    UserExist: string;
    WrongMobileOrEmail: string;
    NotFound: string;
    OtpCodeAlive: string;
    OtpCodeExpired: string;
    WrongOtp: string;
    TryLater: string;
}

const AuthMessage: AuthMessageType = {
    SendOtpSuccessfully: "کد با موفقیت ارسال شد",
    UserExist: "کاربر با این مشخصات وجود دارد",
    WrongMobileOrEmail: "اطلاعات وارد شده اشتباه است",
    NotFound: "کاربر با مشخصات شما یافت نشد",
    OtpCodeAlive: "زمان کد باقی مانده است",
    OtpCodeExpired: "زمان کد منقضی شده است",
    WrongOtp: "کد وارد شده اشتباه است",
    TryLater: "لطفا بعدا تلاش کنید",
};

export default AuthMessage;
