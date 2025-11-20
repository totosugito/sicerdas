import app from './app-locale';
import home from './home-locale';
import labels from './labels-locale';
import signIn from './sign-in-locale';
import signUp from './sign-up-locale';
import forgetPassword from './forget-password-locale';
import resetPassword from './reset-password-locale';
import otpVerification from './otp-verification-locale';
import message from './message-locale';
import user from './user-locale';

const localeId = {
  translation: {
    app: app,
    home: home,
    labels: labels,
    signIn: signIn,
    signUp: signUp,
    forgetPassword: forgetPassword,
    resetPassword: resetPassword,
    otpVerification: otpVerification,
    message: message,
    user: user
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}