import React from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const CategoryOption = ({
  value,
  id,
  label,
  count,
  subLabel,
}: {
  value: string;
  id: string;
  label: string;
  count?: number;
  subLabel?: string | React.ReactNode;
}) => (
  <div
    className={`flex space-x-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${subLabel ? "items-center py-0" : "items-center"}`}
  >
    <RadioGroupItem value={value} id={id} className={`peer ${subLabel ? "mt-1" : ""}`} />
    <Label
      htmlFor={id}
      className="flex-1 cursor-pointer font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white"
    >
      <div className="flex items-center">
        <span>
          {label}
          {count !== undefined && (
            <span className="text-xs text-slate-400 font-normal ml-2">({count})</span>
          )}
        </span>
      </div>
      {subLabel && <div className="text-xs text-slate-500 font-normal mt-0.5">{subLabel}</div>}
    </Label>
  </div>
);

export const FilterCheckbox = ({
  id,
  label,
  count,
  checked,
  onCheckedChange,
  className = "",
}: {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onCheckedChange: (c: boolean) => void;
  className?: string;
}) => (
  <div
    className={`flex items-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${className}`}
  >
    <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c as boolean)} />
    <Label
      htmlFor={id}
      className="flex-1 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 peer-data-[state=checked]:text-slate-900 dark:peer-data-[state=checked]:text-white flex items-center"
    >
      <span>
        {label}
        {count !== undefined && (
          <span className="text-xs text-slate-400 font-normal ml-2">({count})</span>
        )}
      </span>
    </Label>
  </div>
);
