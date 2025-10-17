import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React from "react";
import {DatePicker} from "@/components/custom/components";
import {UseFormReturn} from "react-hook-form";

export type FormDatePickerProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
  };
  disabled?: boolean
  className?: string
}

export const FormDatePicker = ({form, item, ...props} : FormDatePickerProps) => {
  return(
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel>{item.label}</FormLabel>
          <FormControl>
            <DatePicker {...props} value={field.value} onChange={field.onChange}/>
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          <FormMessage/>
        </FormItem>
      )}
    />
  )
}