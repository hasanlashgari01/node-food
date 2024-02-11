interface AuthMessageType {
    SendOtpSuccessfully: string;
    VerifyOtpSuccessfully: string;
    UserExist: string;
    WrongMobileOrEmail: string;
    NotFound: string;
    OtpCodeAlive: string;
    OtpCodeExpired: string;
    OtpCodeUsed: string;
    WrongOtp: string;
    TryLater: string;
    BanUser: string;
}

const AuthMessage: AuthMessageType = {
    SendOtpSuccessfully: "کد با موفقیت ارسال شد",
    VerifyOtpSuccessfully: "کد وارد شده صحیح است",
    UserExist: "کاربر با این مشخصات وجود دارد",
    WrongMobileOrEmail: "اطلاعات وارد شده اشتباه است",
    NotFound: "کاربر با مشخصات شما یافت نشد",
    OtpCodeAlive: "زمان کد باقی مانده است",
    OtpCodeExpired: "زمان کد منقضی شده است",
    OtpCodeUsed: "کد قبلا استفاده شده است",
    WrongOtp: "کد وارد شده اشتباه است",
    TryLater: "لطفا بعدا تلاش کنید",
    BanUser: "حساب کاربری شما مسدود شده است",
};

export default AuthMessage;
