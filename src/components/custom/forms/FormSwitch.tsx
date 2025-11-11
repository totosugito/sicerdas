import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React from "react";
import {UseFormReturn} from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type FormSwitchProps = {
  form: UseFormReturn<any>;
  item: {
    name: string;
    label: string;
    description?: string;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;  // Added labelClassName prop
}

export const FormSwitch = ({
                       form,
                       item,
                       labelClassName = "",  // Added labelClassName prop
                       ...props
                     }: FormSwitchProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              {...props}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className={cn("", labelClassName)}>{item.label}</FormLabel>
            {item.description && <FormDescription>{item.description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};