import app from './app/app-locale';
import home from './app/home-locale';
import labels from './global/labels-locale';
import signIn from './auth/sign-in';
import signUp from './auth/sign-up';
import forgetPassword from './auth/forget-password';
import resetPassword from './auth/reset-password';
import otpVerification from './auth/otp-verification';
import message from './global/message-locale';
import user from './global/user-locale';
import landing from './app/landing-locale';
import booksLatest from './book/books-latest';
import about from './web/about-locale';
import privacy from './web/privacy-locale';
import terms from './web/terms-locale';
import support from './web/support-locale';
import faq from './web/faq-locale';
import periodicTable from './periodic-table/periodic-table';
import chemistryDictionary from './periodic-table/chemistry-dictionary';
import elementComparison from './periodic-table/element-comparison';
import elementDetail from './periodic-table/element-detail';
import bookInfo from './book/book-info';
import bookDetail from './book/book-detail';
import report from './layout/content-report';
import butirPancasila from './constitution/butir-pancasila';
import uud1945 from './constitution/uud-1945';
import uud1945Asli from './constitution/uud-1945-asli';
import listTierPricing from './tier-pricing/list-tier-pricing';
import createTier from './tier-pricing/create-tier';
import uudAmandemen from './constitution/uud-amandemen';
import exam from './exam';

const localeId = {
  translation: {
    app: app,
    home: home,
    labels: labels,
    message: message,
    landing: landing,
    user: user,
    auth: {
      signIn: signIn,
      signUp: signUp,
      forgetPassword: forgetPassword,
      resetPassword: resetPassword,
      otpVerification: otpVerification,
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
    },
    contentReport: report,
    constitution: {
      butirPancasila: butirPancasila,
      uud1945: uud1945,
      uud1945Asli: uud1945Asli,
      uudAmandemen: uudAmandemen
    },
    tierPricing: {
      list: listTierPricing,
      createTier: createTier
    },
    exam: exam
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}