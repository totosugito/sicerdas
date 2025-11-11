import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React from "react";
import {Textarea} from "@/components/ui/textarea";
import {UseFormReturn} from "react-hook-form";
import { cn } from "@/lib/utils";

export type FormTextAreaProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    minRows?: number
    maxRows?: number
    readonly?: boolean
  };
  disabled?: boolean
  className?: string
  labelClassName?: string;  // Added labelClassName prop
  showMessage?: boolean;  // Added showMessage prop
}

export const FormTextArea = ({form, item, labelClassName = "", showMessage = true, ...props} : FormTextAreaProps) => {
  const defaultRows = item?.minRows ?? 2;
  const maxRows = item?.maxRows ?? 10;

  return(
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel className={cn("", labelClassName)}>{item.label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={item.placeholder}
              className="input w-full"
              rows={defaultRows}
              readOnly={item?.readonly}
              {...field}
              {...props}
            />
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          {showMessage && <FormMessage/>}
        </FormItem>
      )}
    />
  )
}