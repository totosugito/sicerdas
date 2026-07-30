import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback, useRef, useEffect, useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder?: string;
  debounce?: number;
}

export const SearchInput = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search...",
  debounce = 500,
}: SearchInputProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (newValue: string) => {
      setDisplayValue(newValue);

      if (debounce === 0) {
        onChange(newValue);
        return;
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        onChange(newValue);
        timerRef.current = null;
      }, debounce);
    },
    [debounce, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        onChange(displayValue);
        onSubmit();
      }
    },
    [displayValue, onChange, onSubmit]
  );

  return (
    <div className="relative w-full lg:max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-10 bg-background/50 border-border/60 focus-visible:ring-primary/20"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {displayValue && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          onClick={() => {
            setDisplayValue("");
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
            onClear();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
