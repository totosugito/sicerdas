import React from "react";
import DatePicker from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

export type FormDatePickerProps = {
  field: any; // The field instance from TanStack form.AppField render prop
  item: {
    label: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
}

export const FormDatePicker = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  ...props
}: FormDatePickerProps) => {
  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <field.Control>
        <DatePicker {...props} value={field.state.value} onChange={field.handleChange} />
      </field.Control>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
}
