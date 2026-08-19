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
  leftIcon?: React.ReactNode;
};

export const FormInput = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  leftIcon,
  ...props
}: FormInputProps) => {
  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground z-10 [&_svg]:size-4">
            {leftIcon}
          </div>
        )}
        <field.Control>
          <Input
            placeholder={item.placeholder}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className={cn(leftIcon ? "pl-9" : "", className)}
            {...props}
          />
        </field.Control>
      </div>
      {item.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
};

