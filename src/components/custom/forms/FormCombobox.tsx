import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {Check, ChevronsUpDown} from "lucide-react"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {UseFormReturn} from "react-hook-form";

export type FormComboboxProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    selectLabel?: string
    searchPlaceholder?: string
    options: Array<{ label: string, value: string }>
    readonly?: boolean
  };
  disabled?: boolean
  className?: string
  labelClassName?: string;  // Added labelClassName prop
}

export const FormCombobox = ({form, item, labelClassName = "", ...props}: FormComboboxProps) => {
  const [open, setOpen] = React.useState(false)

  const selectedRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        if (selectedRef.current) {
          selectedRef.current.scrollIntoView({block: "nearest"});
        }
      });
    }
  }, [open]);

  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel className={cn("", labelClassName)}>{item.label}</FormLabel>
          <Popover open={open} onOpenChange={
            setOpen
          //   (v) => {
          //   if(!item?.readonly) {
          //     setOpen(v);
          //   }
          // }
          } {...props} modal={true}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(`w-full justify-between font-normal ${field.value ? "" : "text-muted-foreground"}`)}
                  disabled={props?.disabled}
                >
                  {field.value
                    ? item?.options.find((it: any) => it.value === field.value)?.label
                    : (item?.placeholder ?? "Search...")}
                  <ChevronsUpDown className="opacity-50"/>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0 overflow-y-auto">
              <Command filter={(value, search) => {
                const option = item?.options.find((it: any) => it.value === value);
                if (!option) return 0;
                return option.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
              }}>
                <CommandInput placeholder={item?.searchPlaceholder ?? "Search..."} className="h-9"/>
                <CommandList>
                  <CommandEmpty>No item found.</CommandEmpty>
                  <CommandGroup>
                    {item?.options.map((it: any) => (
                      <CommandItem
                        ref={field.value === it.value ? selectedRef : null}
                        key={it.value}
                        value={it.value}
                        onSelect={(currentValue) => {
                          const newValue = currentValue === field.value ? "" : currentValue;
                          form.setValue(field.name, newValue);
                          setOpen(false);
                        }}
                        // className={cn(`${field.value === it.value ? "bg-chart-2 text-background" : ""}`)}
                      >
                        {it.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            field.value === it.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          <FormMessage/>
        </FormItem>
      )}
    />
  )
}