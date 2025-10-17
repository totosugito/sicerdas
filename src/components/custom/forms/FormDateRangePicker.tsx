import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React from "react";
import {DatePickerWithRange} from "@/components/custom/components";
import {UseFormReturn} from "react-hook-form";

export type FormDateRangePickerProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    from?: Date
    to?: Date
  };
  disabled?: boolean
}

export const FormDateRangePicker = ({form, item, ...props} : {form: any, item: FormDateRangePickerProps | any}) => {
  return(
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel>{item.label}</FormLabel>
          <FormControl>
            <DatePickerWithRange {...props} fromDate={item.from} toDate={item.to} onDateChange={(v) => {
              field.onChange(v);
            }}/>
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          <FormMessage/>
        </FormItem>
      )}
    />
  )
}
