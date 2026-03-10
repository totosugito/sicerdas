import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

export type FormInputProps = {
  form: UseFormReturn<any>;
  item: {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;  // Added labelClassName prop
  showMessage?: boolean;  // Added showMessage prop
}

export const FormInput = ({
  form,
  item,
  labelClassName = "",  // Added labelClassName prop
  showMessage = true,  // Added showMessage prop
  ...props
}: FormInputProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn("", labelClassName)}>{item.label}{item.required && <span className="text-red-500">*</span>}</FormLabel>
          <FormControl>
            <Input
              placeholder={item.placeholder}
              {...field}
              {...props}
            />
          </FormControl>
          {item.description && <FormDescription>{item.description}</FormDescription>}
          {showMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
}