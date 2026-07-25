import React from "react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { cn } from "@/lib/utils";

export type FormDateRangePickerProps = {
  field: any; // TanStack Form Field instance
  item: {
    label: string;
    placeholder?: string;
    description?: string;
    from?: Date;
    to?: Date;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
};

export const FormDateRangePicker = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  ...props
}: FormDateRangePickerProps) => {
  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <field.Control>
        <DatePickerWithRange
          {...props}
          className={className}
          fromDate={item.from}
          toDate={item.to}
          onDateChange={(v) => {
            field.handleChange(v);
          }}
        />
      </field.Control>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
};
