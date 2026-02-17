import chemistryDictionary from './periodic-table/chemistry-dictionary';
import periodicTable from './periodic-table/periodic-table';
import elementComparison from './periodic-table/element-comparison';
import elementDetail from './periodic-table/element-detail';
import listTierPricing from './tier-pricing/list-tier-pricing';

const localeEn = {
  translation: {
    periodicTable: {
      periodicTable: periodicTable,
      chemistryDictionary: chemistryDictionary,
      elementComparison: elementComparison,
      elementDetail: elementDetail
    },
    tierPricing: {
      list: listTierPricing
    }
  }
}

export default {
  language: 'en',
  country: 'us',
  name: 'English',
  embeddedLocale: localeEn
}