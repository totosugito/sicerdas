import React from "react";
import { Popover, PopoverContent, PopoverPositioner, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  ...props
}: FormComboboxProps) => {
  const popoverClassName = item.popoverClassName ?? "min-w-[250px]";
  const [open, setOpen] = React.useState(false);

  const selectedRef = React.useRef<HTMLDivElement>(null);
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

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        if (selectedRef.current) {
          selectedRef.current.scrollIntoView({ block: "nearest" });
        }
      });
    }
  }, [open]);

  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <Popover open={open} onOpenChange={setOpen} {...props} modal={true}>
        <field.Control>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between font-normal min-w-0 pr-10 relative",
                  field.state.value ? "" : "text-muted-foreground",
                  className,
                )}
                disabled={props?.disabled}
              >
                <span className="truncate overflow-hidden text-left flex-1 mr-2">
                  {field.state.value
                    ? item?.options.find((it: any) => it.value === field.state.value)?.label
                    : item?.placeholder ?? "Select option"}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />
              </Button>
            }
          />
        </field.Control>
        <PopoverPositioner>
          <PopoverContent
            className={cn(
              "w-[var(--anchor-width)] p-0 z-50",
              popoverClassName,
            )}
          >
            <Command
              key={`${item?.options?.length ?? 0}-${item?.isLoading ? "loading" : "ready"}`}
              shouldFilter={!item?.serverSideSearch}
              filter={(value, search) => {
                if (item?.serverSideSearch) return 1;
                const option = item?.options.find(
                  (it: any) => String(it.value).toLowerCase() === value.toLowerCase(),
                );
                if (!option) return 0;
                return option.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
              }}
            >
              <CommandInput
                placeholder={item?.searchPlaceholder ?? "Search..."}
                className="h-9"
                onValueChange={item?.onSearchChange ? handleSearchChange : undefined}
              />
              <CommandList
                onScroll={(e) => {
                  const target = e.currentTarget;
                  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 1) {
                    if (item?.onScrollEnd) {
                      item.onScrollEnd();
                    }
                  }
                }}
              >
                <CommandEmpty>{item.isLoading ? "Loading..." : "No item found."}</CommandEmpty>
                <CommandGroup>
                  {item?.options.map((it: any) => (
                    <CommandItem
                      ref={field.state.value === it.value ? selectedRef : null}
                      key={it.value}
                      value={it.value}
                      onSelect={() => {
                        const newValue = it.value === field.state.value ? "" : it.value;
                        field.handleChange(newValue);
                        setOpen(false);
                      }}
                    >
                      {it.label}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          field.state.value === it.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </PopoverPositioner>
      </Popover>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
};
