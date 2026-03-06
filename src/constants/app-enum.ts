
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

export const EnumPeriodicViewMode = {
  theme1: {
    value: 'theme1',
    label: 'Theme 1'
  },
  theme2: {
    value: 'theme2',
    label: 'Theme 2'
  },
  theme3: {
    value: 'theme3',
    label: 'Theme 3'
  },
  theme4: {
    value: 'theme4',
    label: 'Theme 4'
  },
}

export const durationOnMinutes = [
  { label: "0", value: "0" },
  { label: "15", value: "15" },
  { label: "20", value: "20" },
  { label: "30", value: "30" },
  { label: "60", value: "60" },
]