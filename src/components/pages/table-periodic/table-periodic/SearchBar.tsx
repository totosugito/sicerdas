import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hasSearchResults?: boolean;
}

export const SearchBar = ({ 
  searchQuery, 
  onSearchChange,
  hasSearchResults = true
}: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by name, symbol, or atomic number..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-10 bg-card"
      />
      {searchQuery && (
        <Button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-1 h-7 w-7 text-muted-foreground"
          variant="ghost"
          size="icon"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {searchQuery && hasSearchResults === false && (
        <p className="text-sm text-muted-foreground mt-2">No elements found matching "{searchQuery}"</p>
      )}
    </div>
  );
};