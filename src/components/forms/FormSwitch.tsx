import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type FormSwitchProps = {
  field: any; // The field instance from TanStack form.AppField render prop
  item: {
    label: string;
    description?: string;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
}

export const FormSwitch = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  ...props
}: FormSwitchProps) => {
  return (
    <div data-slot="form-item" className="flex flex-row items-start space-x-3 space-y-0">
      <field.Control>
        <Switch
          checked={field.state.value}
          onCheckedChange={field.handleChange}
          {...props}
        />
      </field.Control>
      <div className="space-y-1 leading-none">
        <field.Label className={cn("", labelClassName)}>
          {item.label}
          {item.required && <span className="text-red-500">*</span>}
        </field.Label>
        {item.description && <field.Description>{item.description}</field.Description>}
      </div>
      {showMessage && <field.Message />}
    </div>
  );
}
