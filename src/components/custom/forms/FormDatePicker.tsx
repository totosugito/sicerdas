import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import React from "react";
import { DatePicker } from "@/components/custom/components";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

export type FormDatePickerProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    required?: boolean;
  };
  disabled?: boolean
  className?: string
  labelClassName?: string;  // Added labelClassName prop
  showMessage?: boolean;  // Added showMessage prop
}

export const FormDatePicker = ({ form, item, labelClassName = "", showMessage = true, ...props }: FormDatePickerProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn("", labelClassName)}>{item.label}{item.required && <span className="text-red-500">*</span>}</FormLabel>
          <FormControl>
            <DatePicker {...props} value={field.value} onChange={field.onChange} />
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          {showMessage && <FormMessage />}
        </FormItem>
      )}
    />
  )
}