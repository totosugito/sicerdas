import React from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

export type FormMultiSelectProps = {
  field: any; // TanStack Form Field instance
  item: {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    selectLabel?: string;
    searchPlaceholder?: string;
    maxCount?: number;
    options: Array<{ label: string; value: string }>;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
};

export const FormMultiSelect = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  ...props
}: FormMultiSelectProps) => {
  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <field.Control>
        <MultiSelect
          {...props}
          options={item.options}
          value={field.state.value}
          onValueChange={field.handleChange}
          placeholder={item?.placeholder}
          maxCount={item?.maxCount ?? 3}
        />
      </field.Control>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
};
