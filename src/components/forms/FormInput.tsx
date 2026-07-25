import { Input } from "@/components/ui/input";
import React from "react";
import { cn } from "@/lib/utils";

export type FormInputProps = {
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

export const FormInput = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  ...props
}: FormInputProps) => {
  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <field.Control>
        <Input
          placeholder={item.placeholder}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className={className}
          {...props}
        />
      </field.Control>
      {item.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
}
