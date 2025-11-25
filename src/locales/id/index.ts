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
import landing from './landing-locale';
import booksLatest from './books-latest-locale';
import about from './public/about-locale';
import privacy from './public/privacy-locale';
import terms from './public/terms-locale';
import support from './public/support-locale';
import faq from './public/faq-locale';

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
    user: user,
    landing: landing,
    booksLatest: booksLatest,
    public: {
      about: about,
      privacy: privacy,
      terms: terms,
      support: support,
      faq: faq
    }
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}