import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import InputNumber from "rc-input-number";
import "@/assets/rc-input.css";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";

export type FormNumberProps = {
  form: UseFormReturn<any>;
  item: {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    prefix?: string;
    suffix?: string;
    precision?: number;
    required?: boolean;
    useThousandSeparator?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string; // Added labelClassName prop
  showMessage?: boolean; // Added showMessage prop
};

export const FormNumber = ({
  form,
  item,
  labelClassName = "", // Added labelClassName prop
  showMessage = true, // Added showMessage prop
  ...props
}: FormNumberProps) => {
  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn("", labelClassName)}>
            {item.label}
            {item.required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <InputNumber
              className={cn(
                "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                props?.disabled
                  ? "opacity-50 disabled cursor-not-allowed"
                  : "hover:border-ring hover:ring-ring/50 hover:ring-[0px]",
                props?.className,
              )}
              precision={item?.precision ?? undefined}
              {...field}
              disabled={props?.disabled}
              formatter={(value) => {
                const useThousandSeparator = item?.useThousandSeparator ?? true;
                const formatNumber = (val: any) => {
                  if (val === undefined || val === null || val === "") return "";
                  const parts = val.toString().split(".");
                  if (useThousandSeparator) {
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  }
                  return parts.join(".");
                };

                const formattedValue =
                  item?.precision === 0 && useThousandSeparator ? `${value}` : formatNumber(value);

                if (item?.prefix) {
                  return `${item?.prefix} ${formattedValue}`;
                } else if (item?.suffix) {
                  return `${formattedValue} ${item?.suffix}`;
                } else {
                  return formattedValue;
                }
              }}
            />
          </FormControl>
          {item.description && <FormDescription>{item.description}</FormDescription>}
          {showMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
};
