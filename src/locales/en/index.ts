import chemistryDictionary from './periodic-table/chemistry-dictionary-locale';
import periodicTable from './periodic-table/periodic-table-locale';
import elementComparison from './periodic-table/element-comparison-locale';
import elementDetail from './periodic-table/element-detail-locale';

const localeEn = {
  translation: {
    periodicTable: {
      periodicTable: periodicTable,
      chemistryDictionary: chemistryDictionary,
      elementComparison: elementComparison,
      elementDetail: elementDetail
    }
  }
}

export default {
  language: 'en',
  country: 'us',
  name: 'English',
  embeddedLocale: localeEn
}