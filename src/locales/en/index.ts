import chemistryDictionary from './periodic-table/chemistry-dictionary-locale';
import periodicTable from './periodic-table/periodic-table-locale';
import elementComparison from './periodic-table/element-comparison-locale';

const localeEn = {
  translation: {
    periodicTable: {
      chemistryDictionary: chemistryDictionary,
      periodicTable: periodicTable,
      elementComparison: elementComparison
    }
  }
}

export default {
  language: 'en',
  country: 'us',
  name: 'English',
  embeddedLocale: localeEn
}