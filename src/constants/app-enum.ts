
export const CurrencyList = {
  IDR: {
    symbol: 'Rp',
    value: 'IDR',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  USD: {
    symbol: '$',
    value: 'USD',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
}

export const EnumViewMode = {
  grid: {
    value: 'grid',
    label: 'Grid'
  },
  list: {
    value: 'list',
    label: 'List'
  },
  table: {
    value: 'table',
    label: 'Table'
  },
  card: {
    value: 'card',
    label: 'Card'
  },
  gantt: {
    value: 'gantt',
    label: 'Gantt'
  },
  details: {
    value: 'details',
    label: 'Details'
  }
} as const