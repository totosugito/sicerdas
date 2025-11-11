import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React from "react";
import {UseFormReturn} from "react-hook-form";

export type FormInputProps = {
  form: UseFormReturn<any>;
  item: {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
  };
  disabled?: boolean;
  className?: string;
}

export const FormInput = ({
                     form,
                     item,
                     ...props
                   }: FormInputProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={""}>{item.label}</FormLabel>
          <FormControl>
            <Input
              placeholder={item.placeholder}
              {...field}
              {...props}
            />
          </FormControl>
          {item.description && <FormDescription>{item.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}