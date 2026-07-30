import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectPositioner,
} from "@/components/ui/select";
import { LucideIcon } from "lucide-react";

interface FilterSelectProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

export const FilterSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  icon: Icon,
  disabled,
  className = "w-[200px]",
}: FilterSelectProps) => {
  return (
    <Select
      value={value || "all"}
      onValueChange={(val) => {
        const newValue = !val || val === "all" ? undefined : val;
        onValueChange(newValue);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={`${className} flex items-center gap-2`}>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        <SelectValue
          placeholder={placeholder}
          render={(_, { value: selectedVal }) => {
            if (!selectedVal || selectedVal === "all") {
              return <span className="text-left truncate block w-full">{placeholder}</span>;
            }
            const matched = options.find((o) => o.value === selectedVal);
            return <span className="text-left truncate block w-full">{matched?.label || selectedVal}</span>;
          }}
        />
      </SelectTrigger>
      <SelectPositioner>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPositioner>
    </Select>
  );
};
