import chemistryDictionary from './periodic-table/chemistry-dictionary-locale';
import periodicTable from './periodic-table/periodic-table-locale';

const localeEn = {
  translation: {
    periodicTable: {
      chemistryDictionary: chemistryDictionary,
      periodicTable: periodicTable
    }
  }
}

export default {
  language: 'en',
  country: 'us',
  name: 'English',
  embeddedLocale: localeEn
}