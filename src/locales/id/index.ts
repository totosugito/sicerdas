import app from './app/app-locale';
import labels from './global/labels-locale';
import auth from './auth';
import message from './global/message-locale';
import landing from './app/landing-locale';
import web from './web';
import periodicTable from './periodic-table';
import book from './book';
import report from './layout/content-report';
import constitution from './constitution';
import exam from './exam';
import appTier from './app-tier';
import user from './user';
import educationGrade from './education-grade';

const localeId = {
  translation: {
    app: app,
    labels: labels,
    message: message,
    landing: landing,
    auth: auth,
    web: web,
    periodicTable: periodicTable,
    book: book,
    contentReport: report,
    constitution: constitution,
    appTier: appTier,
    exam: exam,
    user: user,
    educationGrade: educationGrade,
  }
}

export default {
  language: 'id',
  country: 'id',
  name: 'Indonesia',
  embeddedLocale: localeId
}