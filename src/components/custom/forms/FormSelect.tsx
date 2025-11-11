import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React from "react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {UseFormReturn} from "react-hook-form";

export type FormSelectProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    selectLabel?: string
    options: Array<{ label: string, value: string, color?: string }>
  };
  disabled?: boolean
  className?: string
}

export const FormSelect = ({form, item, ...props}: FormSelectProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel>{item.label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            {...props}
          >
            <FormControl>
              <SelectTrigger className={cn("w-full", props?.className)}>
                <SelectValue placeholder={item.placeholder}>
                  {field.value && (() => {
                    const selectedOption = item.options.find(option => option.value === field.value);
                    return selectedOption ? (
                      <div className="flex items-center">
                        {selectedOption.color && (
                          <div 
                            className="w-3 h-3 rounded-sm mr-2" 
                            style={{ backgroundColor: selectedOption.color }}
                          />
                        )}
                        <span>{selectedOption.label}</span>
                      </div>
                    ) : null;
                  })()}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                {item?.selectLabel && <SelectLabel>{item?.selectLabel ?? "Choose a filter"}</SelectLabel>}
                {item.options?.map((it: any) => (
                  <SelectItem key={it?.value} value={it?.value}>
                    <div className="flex items-center">
                      {it?.color && (
                        <div 
                          className="w-3 h-3 rounded-sm mr-2" 
                          style={{ backgroundColor: it?.color }}
                        />
                      )}
                      <span>{it?.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          <FormMessage/>
        </FormItem>
      )}
    />
  )
}