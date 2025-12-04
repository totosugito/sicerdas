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
import about from './web/about-locale';
import privacy from './web/privacy-locale';
import terms from './web/terms-locale';
import support from './web/support-locale';
import faq from './web/faq-locale';
import periodicTable from './periodic-table/periodic-table-locale';
import chemistryDictionary from './periodic-table/chemistry-dictionary-locale';

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
    web: {
      about: about,
      privacy: privacy,
      terms: terms,
      support: support,
      faq: faq
    },
    periodicTable: {
      periodicTable: periodicTable,
      chemistryDictionary: chemistryDictionary
    }
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}