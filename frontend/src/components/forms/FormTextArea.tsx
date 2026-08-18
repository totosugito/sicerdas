import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type FormTextAreaProps = {
  field: any; // The field instance from TanStack form.AppField render prop
  item: {
    label: string;
    placeholder?: string;
    description?: string;
    minRows?: number;
    maxRows?: number;
    readonly?: boolean;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
}

export const FormTextArea = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  ...props
}: FormTextAreaProps) => {
  const defaultRows = item?.minRows ?? 2;

  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <field.Control>
        <Textarea
          placeholder={item.placeholder}
          className={cn("input w-full", className)}
          rows={defaultRows}
          readOnly={item?.readonly}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          {...props}
        />
      </field.Control>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
}
