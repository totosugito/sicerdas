import chemistryDictionary from './periodic-table/chemistry-dictionary';
import periodicTable from './periodic-table/periodic-table';
import elementComparison from './periodic-table/element-comparison';
import elementDetail from './periodic-table/element-detail';
import course from './course';

const localeEn = {
  translation: {
    periodicTable: {
      periodicTable: periodicTable,
      chemistryDictionary: chemistryDictionary,
      elementComparison: elementComparison,
      elementDetail: elementDetail
    },
    course: course,
  }
}

export default {
  language: 'en',
  country: 'us',
  name: 'English',
  embeddedLocale: localeEn
}