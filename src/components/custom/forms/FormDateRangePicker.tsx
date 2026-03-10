import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import React from "react";
import { DatePickerWithRange } from "@/components/custom/components";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

export type FormDateRangePickerProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    from?: Date
    to?: Date
    required?: boolean;
  };
  disabled?: boolean
  labelClassName?: string;
  showMessage?: boolean;
}

export const FormDateRangePicker = ({ form, item, labelClassName = "", showMessage = true, ...props }: FormDateRangePickerProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn("", labelClassName)}>{item.label}{item.required && <span className="text-red-500">*</span>}</FormLabel>
          <FormControl>
            <DatePickerWithRange {...props} fromDate={item.from} toDate={item.to} onDateChange={(v) => {
              field.onChange(v);
            }} />
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          {showMessage && <FormMessage />}
        </FormItem>
      )}
    />
  )
}