import app from './app/app-locale';
import home from './app/home-locale';
import labels from './global/labels-locale';
import signIn from './auth/sign-in-locale';
import signUp from './auth/sign-up-locale';
import forgetPassword from './auth/forget-password-locale';
import resetPassword from './auth/reset-password-locale';
import otpVerification from './auth/otp-verification-locale';
import message from './global/message-locale';
import user from './global/user-locale';
import landing from './app/landing-locale';
import booksLatest from './book/books-latest-locale';
import about from './web/about-locale';
import privacy from './web/privacy-locale';
import terms from './web/terms-locale';
import support from './web/support-locale';
import faq from './web/faq-locale';
import periodicTable from './periodic-table/periodic-table-locale';
import chemistryDictionary from './periodic-table/chemistry-dictionary-locale';
import elementComparison from './periodic-table/element-comparison-locale';
import elementDetail from './periodic-table/element-detail-locale';
import bookInfo from './book/book-info-locale';
import bookDetail from './book/book-detail-locale';

const localeId = {
  translation: {
    app: app,
    home: home,
    labels: labels,
    message: message,
    landing: landing,
    auth: {
      signIn: signIn,
      signUp: signUp,
      forgetPassword: forgetPassword,
      resetPassword: resetPassword,
      otpVerification: otpVerification,
      user: user,
    },
    web: {
      about: about,
      privacy: privacy,
      terms: terms,
      support: support,
      faq: faq
    },
    periodicTable: {
      periodicTable: periodicTable,
      chemistryDictionary: chemistryDictionary,
      elementComparison: elementComparison,
      elementDetail: elementDetail
    },
    book: {
      info: bookInfo,
      booksLatest: booksLatest,
      detail: bookDetail,
    }
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}