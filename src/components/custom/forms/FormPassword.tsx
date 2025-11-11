import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import {UseFormReturn} from "react-hook-form";
import {cn} from "@/lib/utils";

export type FormPasswordProps = {
  form: UseFormReturn<any>;
  item: {
    name: string
    label: string
    placeholder?: string
    description?: string
    readonly?: boolean
  };
  disabled?: boolean
  className?: string
  labelClassName?: string  // Added labelClassName prop
  showMessage?: boolean  // Added showMessage prop
}

export const FormPassword = ({form, item, labelClassName = "", showMessage = true, ...props}: FormPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      control={form.control}
      name={item.name}
      render={({field}) => (
        <FormItem>
          <FormLabel className={cn("", labelClassName)}>{item.label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={item.placeholder}
                readOnly={item?.readonly}
                {...props}
                {...field}
              />

              <Button
                type="button"
                variant={"ghost"}
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/90 hover:text-foreground/90"
                onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormControl>
          {item?.description && <FormDescription>{item.description}</FormDescription>}
          {showMessage && <FormMessage/>}
        </FormItem>
      )}
    />
  )
}