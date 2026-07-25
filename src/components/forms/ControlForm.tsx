import React, { forwardRef } from "react";
import { FormInput } from "./FormInput";
import { FormPassword } from "./FormPassword";
import { FormNumber } from "./FormNumber";
import { FormSelect } from "./FormSelect";
import { FormTextArea } from "./FormTextArea";
import { FormCheckbox } from "./FormCheckbox";
import { FormSwitch } from "./FormSwitch";
import { cn } from "@/lib/utils";

// Lazy load inputs that are not migrated yet or require special handlers
const FormBlockNote = React.lazy(() =>
  import("@/components/custom/components/block-note/FormBlockNote").then((m) => ({
    default: m.FormBlockNote,
  })),
);

type Props = {
  field: any; // TanStack Form Field instance
  item: any;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  showMessage?: boolean;
};

export const ControlForm = forwardRef(
  (
    {
      field,
      item,
      className,
      wrapperClassName,
      labelClassName = "text-foreground font-medium",
      showMessage = true,
      ...props
    }: Props,
    ref,
  ) => {
    const defaultClassName = "focus-visible:ring-[0px]";
    const isDisabled = props.disabled !== undefined ? props.disabled : item.disabled;

    const itemType = item.type;
    if (itemType === "password") {
      return (
        <FormPassword
          field={field}
          className={cn(defaultClassName, className)}
          item={item}
          labelClassName={labelClassName}
          showMessage={showMessage}
          {...props}
          disabled={isDisabled}
        />
      );
    } else if (itemType === "number") {
      return (
        <FormNumber
          field={field}
          item={item}
          className={cn(defaultClassName, className)}
          labelClassName={labelClassName}
          showMessage={showMessage}
          {...props}
          disabled={isDisabled}
        />
      );
    } else if (itemType === "select") {
      return (
        <FormSelect
          field={field}
          item={item}
          {...props}
          className={cn(defaultClassName, className)}
          labelClassName={labelClassName}
          showMessage={showMessage}
          disabled={isDisabled}
        />
      );
    } else if (itemType === "textarea") {
      return (
        <FormTextArea
          field={field}
          item={item}
          className={cn(defaultClassName, className)}
          labelClassName={labelClassName}
          showMessage={showMessage}
          {...props}
          disabled={isDisabled}
        />
      );
    } else if (itemType === "checkbox") {
      return (
        <FormCheckbox
          field={field}
          item={item}
          className={cn(defaultClassName, className)}
          labelClassName={labelClassName}
          showMessage={showMessage}
          {...props}
          disabled={isDisabled}
        />
      );
    } else if (itemType === "switch") {
      return (
        <FormSwitch
          field={field}
          item={item}
          className={cn(defaultClassName, className)}
          labelClassName={labelClassName}
          showMessage={showMessage}
          {...props}
          disabled={isDisabled}
        />
      );
    } else {
      // Default to standard input
      return (
        <FormInput
          field={field}
          item={item}
          className={cn(defaultClassName, className)}
          labelClassName={labelClassName}
          showMessage={showMessage}
          {...props}
          disabled={isDisabled}
        />
      );
    }
  },
);
