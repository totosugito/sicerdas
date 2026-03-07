import { Button } from '@/components/ui/button'
import { useAppTranslation } from '@/lib/i18n-typed'

// Alphabet group ranges
const ALPHABET_GROUPS = [
  { id: 'all', labelKey: 'periodicTable.chemistryDictionary.alphabetFilter.all', range: /^[A-Z]/ },
  { id: 'a-f', labelKey: 'periodicTable.chemistryDictionary.alphabetFilter.af', range: /^[A-F]/ },
  { id: 'g-l', labelKey: 'periodicTable.chemistryDictionary.alphabetFilter.gl', range: /^[G-L]/ },
  { id: 'm-r', labelKey: 'periodicTable.chemistryDictionary.alphabetFilter.mr', range: /^[M-R]/ },
  { id: 's-z', labelKey: 'periodicTable.chemistryDictionary.alphabetFilter.sz', range: /^[S-Z]/ },
]

interface AlphabetFilterProps {
  activeGroup: string
  onGroupChange: (groupId: string) => void
}

export function AlphabetFilter({ activeGroup, onGroupChange }: AlphabetFilterProps) {
  const { t } = useAppTranslation()

  return (
    <div className="flex justify-center flex-wrap gap-2 mb-6">
      {ALPHABET_GROUPS.map((group) => (
        <Button
          key={group.id}
          size="icon"
          variant={activeGroup === group.id ? 'default' : 'outline'}
          onClick={() => onGroupChange(group.id)}
          className="px-4"
        >
          {t(group.labelKey as any)}
        </Button>
      ))}
    </div>
  )
}

export { ALPHABET_GROUPS }