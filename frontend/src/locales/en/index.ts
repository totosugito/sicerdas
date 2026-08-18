import periodicTable from './periodic-table';
import course from './course';
import web from './web';
import user from './user';
import report from './layout/content-report';
import labels from './global/labels-locale';
import message from './global/message-locale';
import exam from './exam';
import education from './education';
import book from './book';
import auth from './auth';
import app from './app/app-locale';
import landing from './app/landing-locale';
import tier from './tier';
import version from './version';

const localeEn = {
  translation: {
    periodicTable: periodicTable,
    course: course,
    web: web,
    user: user,
    contentReport: report,
    labels: labels,
    message: message,
    exam: exam,
    education: education,
    book: book,
    auth: auth,
    app: app,
    landing: landing,
    tier: tier,
    version: version,
  }
}

export default {
  language: 'en',
  country: 'us',
  name: 'English',
  embeddedLocale: localeEn
}