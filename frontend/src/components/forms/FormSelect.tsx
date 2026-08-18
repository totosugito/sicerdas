import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectPositioner,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FormSelectProps = {
  field: any; // The field instance from TanStack form.AppField render prop
  item: {
    label: string;
    placeholder?: string;
    description?: string;
    selectLabel?: string;
    options: Array<{ label: string; value: string; color?: string }>;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
}

export const FormSelect = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  ...props
}: FormSelectProps) => {
  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <Select
        key={`${field.name}-${field.state.value}`}
        onValueChange={field.handleChange}
        value={field.state.value}
        {...props}
      >
        <field.Control>
          <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder={item.placeholder}>
              {field.state.value &&
                (() => {
                  const selectedOption = item.options.find(
                    (option) => option.value === field.state.value,
                  );
                  return selectedOption ? (
                    <div className="flex items-center overflow-hidden">
                      {selectedOption.color && (
                        <div
                          className="w-3 h-3 rounded-sm mr-2 flex-shrink-0"
                          style={{ backgroundColor: selectedOption.color }}
                        />
                      )}
                      <span className="truncate">{selectedOption.label}</span>
                    </div>
                  ) : null;
                })()}
            </SelectValue>
          </SelectTrigger>
        </field.Control>
        <SelectPositioner>
          <SelectContent>
            <SelectGroup>
              {item?.selectLabel && (
                <SelectLabel>{item?.selectLabel ?? "Choose a filter"}</SelectLabel>
              )}
              {item.options?.map((it: any) => (
                <SelectItem key={it?.value} value={it?.value}>
                  <div className="flex items-center overflow-hidden">
                    {it?.color && (
                      <div
                        className="w-3 h-3 rounded-sm mr-2 flex-shrink-0"
                        style={{ backgroundColor: it?.color }}
                      />
                    )}
                    <span className="truncate">{it?.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </SelectPositioner>
      </Select>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
}
