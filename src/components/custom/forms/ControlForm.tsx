import React, { forwardRef } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormInput } from "./FormInput";
import { FormPassword } from "./FormPassword";
import { FormNumber } from "./FormNumber";
import { FormCombobox } from "./FormCombobox";
import { FormSelect } from "./FormSelect";
import { FormMultiSelect } from "./FormMultiSelect";
import { FormDatePicker } from "./FormDatePicker";
import { FormTextArea } from "./FormTextArea";
import { FormUpload } from "./FormUpload";
import { FormCheckbox } from "./FormCheckbox";
import { cn } from "@/lib/utils";
import { FormSwitch } from "./FormSwitch";
const FormBlockNote = React.lazy(() =>
  import("@/components/custom/components/block-note/FormBlockNote").then((m) => ({
    default: m.FormBlockNote,
  })),
);

type Props = {
  form: UseFormReturn<any>;
  item: any;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string; // Added labelClassName prop
  showMessage?: boolean; // Added showMessage prop
};

export const ControlForm = forwardRef(
  (
    {
      form,
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

    return (
      <div className={cn("flex flex-col gap-y-1", wrapperClassName)}>
        <Controller
          name={item.name}
          control={form.control}
          render={({ field }) => {
            const itemType = item.type;
            if (itemType === "password") {
              return (
                <FormPassword
                  {...field}
                  form={form}
                  className={cn(defaultClassName, className)}
                  item={item}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  {...props}
                  disabled={isDisabled}
                />
              );
            } else if (item.type === "number") {
              return (
                <FormNumber
                  {...field}
                  form={form}
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
                  {...field}
                  form={form}
                  item={item}
                  {...props}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  disabled={isDisabled}
                />
              );
            } else if (itemType === "combobox") {
              return (
                <FormCombobox
                  {...field}
                  form={form}
                  item={item}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  {...props}
                  disabled={isDisabled}
                />
              );
            } else if (itemType === "multiselect") {
              return (
                <FormMultiSelect
                  {...field}
                  form={form}
                  item={item}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  {...props}
                  disabled={isDisabled}
                />
              );
            } else if (itemType === "date") {
              return (
                <FormDatePicker
                  {...field}
                  form={form}
                  item={item}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  {...props}
                  disabled={isDisabled}
                />
              );
            } else if (itemType === "textarea") {
              return (
                <FormTextArea
                  {...field}
                  form={form}
                  item={item}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  {...props}
                  disabled={isDisabled}
                />
              );
            } else if (itemType === "upload") {
              return (
                <FormUpload
                  {...field}
                  {...props}
                  form={form}
                  item={item}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  disabled={isDisabled}
                />
              );
            } else if (itemType === "checkbox") {
              return (
                <FormCheckbox
                  form={form}
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
                  form={form}
                  item={item}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  {...props}
                  disabled={isDisabled}
                />
              );
            } else if (itemType === "blocknote") {
              return (
                <React.Suspense
                  fallback={<div className="h-[400px] rounded-md border bg-muted animate-pulse" />}
                >
                  <FormBlockNote
                    form={form}
                    item={item}
                    className={cn(defaultClassName, className)}
                    labelClassName={labelClassName}
                    showMessage={showMessage}
                    {...props}
                    disabled={isDisabled}
                  />
                </React.Suspense>
              );
            } else {
              return (
                <FormInput
                  {...field}
                  form={form}
                  item={item}
                  className={cn(defaultClassName, className)}
                  labelClassName={labelClassName}
                  showMessage={showMessage}
                  {...props}
                  disabled={isDisabled}
                />
              );
            }
          }}
        />
      </div>
    );
  },
);
