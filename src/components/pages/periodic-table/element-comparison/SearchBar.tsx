import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  placeholder: string;
}

export function SearchBar({ searchTerm, onSearchTermChange, placeholder }: SearchBarProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="flex-1 w-full relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10 pr-10 bg-card"
        />
        {searchTerm && (
          <Button
            onClick={() => onSearchTermChange('')}
            className="absolute right-3 top-1 h-7 w-7 text-muted-foreground"
            variant="ghost"
            size="icon"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}