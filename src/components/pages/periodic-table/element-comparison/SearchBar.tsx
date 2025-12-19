import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  placeholder: string;
}

export function SearchBar({ searchTerm, onSearchTermChange, placeholder }: SearchBarProps) {
  return (
    <div className="flex gap-2 p-2 bg-card/80 backdrop-blur-xl rounded-xl shadow-sm border border-border/50 mb-6">
      <div className="flex-1 flex items-center gap-2 px-4">
        <Search className="text-muted-foreground w-4 h-4" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="border-0 p-0 h-auto shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}