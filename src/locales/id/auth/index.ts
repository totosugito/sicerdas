import signIn from "./sign-in";
import signUp from "./sign-up";
import forgetPassword from "./forget-password";
import resetPassword from "./reset-password";
import otpVerification from "./otp-verification";

const obj = {
    signIn: signIn,
    signUp: signUp,
    forgetPassword: forgetPassword,
    resetPassword: resetPassword,
    otpVerification: otpVerification
}

export default obj
