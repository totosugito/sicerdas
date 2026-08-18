import React from "react";
import InputNumber from "rc-input-number";
import "@/assets/rc-input.css";
import { cn } from "@/lib/utils";

export type FormNumberProps = {
  field: any; // The field instance from TanStack form.AppField render prop
  item: {
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
  labelClassName?: string;
  showMessage?: boolean;
}

export const FormNumber = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  ...props
}: FormNumberProps) => {
  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <field.Control>
        <InputNumber
          className={cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            props?.disabled
              ? "opacity-50 disabled cursor-not-allowed"
              : "hover:border-ring hover:ring-ring/50 hover:ring-[0px]",
            className,
          )}
          precision={item?.precision ?? undefined}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={field.handleChange}
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
      </field.Control>
      {item.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
}
