import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {MultiSelect} from "@/components/custom/components";
import { UseFormReturn } from "react-hook-form";

export type FormMultiSelectProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    selectLabel?: string
    searchPlaceholder?: string
    maxCount?: number
    options: Array<{ label: string, value: string }>
  };
  disabled?: boolean
  className?: string
}

export const FormMultiSelect = ({form, item, ...props} : FormMultiSelectProps) => {
  return(
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel>{item.label}</FormLabel>
          <FormControl>
            <MultiSelect
              {...props}
              options={item.options}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={item?.placeholder}
              maxCount={item?.maxCount ?? 3}/>
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          <FormMessage/>
        </FormItem>
      )}
    />
  )
}
