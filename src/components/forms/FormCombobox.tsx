import React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxPopup,
  ComboboxPositioner,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";

export type FormComboboxProps = {
  field: any; // TanStack Form Field instance
  item: {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    selectLabel?: string;
    searchPlaceholder?: string;
    options: Array<{ label: string; value: string }>;
    onSearchChange?: (search: string) => void;
    onScrollEnd?: () => void;
    isLoading?: boolean;
    serverSideSearch?: boolean;
    required?: boolean;
    popoverClassName?: string;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
};

export const FormCombobox = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  disabled,
  ...props
}: FormComboboxProps) => {
  const popoverClassName = item.popoverClassName ?? "min-w-[250px]";
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSearchChange = React.useCallback(
    (value: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (item?.onSearchChange) {
          item.onSearchChange(value);
        }
      }, 300);
    },
    [item],
  );

  const handleInputValueChange = React.useCallback(
    (value: string, eventInfo: { reason: any }) => {
      setSearchValue(value);
      if (eventInfo.reason === "input" && item?.onSearchChange) {
        handleSearchChange(value);
      }
    },
    [item?.onSearchChange, handleSearchChange]
  );

  const selectedOption = React.useMemo(() => {
    return item?.options.find((opt) => opt.value === field.state.value) || null;
  }, [item?.options, field.state.value]);

  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <Combobox
        open={open}
        onOpenChange={setOpen}
        value={selectedOption}
        onValueChange={(nextVal) => {
          field.handleChange(nextVal ? nextVal.value : "");
        }}
        items={item?.options || []}
        itemToStringLabel={(opt) => opt.label}
        filter={item?.serverSideSearch ? null : undefined}
        inputValue={searchValue}
        onInputValueChange={handleInputValueChange}
        {...props}
      >
        <field.Control>
          <ComboboxTrigger
            className={cn(
              "w-full justify-between font-normal min-w-0 pr-10 relative text-left",
              field.state.value ? "" : "text-muted-foreground",
              className,
            )}
            disabled={disabled}
          >
            <ComboboxValue placeholder={item?.placeholder ?? "Select option"} />
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />
          </ComboboxTrigger>
        </field.Control>
        <ComboboxPositioner sideOffset={4}>
          <ComboboxPopup
            className={cn(
              "w-[var(--anchor-width)] p-0 z-50",
              popoverClassName,
            )}
            onScroll={(e) => {
              const target = e.currentTarget;
              if (target.scrollHeight - target.scrollTop <= target.clientHeight + 1) {
                if (item?.onScrollEnd) {
                  item.onScrollEnd();
                }
              }
            }}
          >
            <ComboboxInput
              placeholder={item?.searchPlaceholder ?? "Search..."}
              className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-b focus-visible:border-border rounded-none"
            />
            <ComboboxEmpty className="text-center text-sm text-muted-foreground empty:p-0">
              {item.isLoading || (searchValue && !item?.options.some(opt => opt.label.toLowerCase().includes(searchValue.toLowerCase()))) ? (
                <div className="py-6">
                  {item.isLoading ? "Loading..." : "No item found."}
                </div>
              ) : null}
            </ComboboxEmpty>
            <ComboboxList className="p-1">
              {(it: { label: string; value: string }) => (
                <ComboboxItem
                  key={it.value}
                  value={it}
                  className="cursor-pointer flex items-center justify-between pl-4 pr-4 py-2"
                >
                  <span className="truncate">{it.label}</span>
                  <ComboboxItemIndicator className="col-start-auto ml-auto shrink-0" />
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </ComboboxPositioner>
      </Combobox>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
};
