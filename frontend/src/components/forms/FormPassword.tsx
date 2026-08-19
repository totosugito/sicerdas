import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormPasswordProps = {
  field: any; // The field instance from TanStack form.AppField render prop
  item: {
    label: string;
    placeholder?: string;
    description?: string;
    readonly?: boolean;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
  leftIcon?: React.ReactNode;
};

export const FormPassword = ({
  field,
  item,
  labelClassName = "",
  showMessage = true,
  className,
  leftIcon,
  ...props
}: FormPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
            type={showPassword ? "text" : "password"}
            placeholder={item.placeholder}
            readOnly={item?.readonly}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            className={cn(leftIcon ? "pl-9" : "", "pr-10", className)}
            {...props}
          />
        </field.Control>

        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none z-10 cursor-pointer"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {item?.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
};

