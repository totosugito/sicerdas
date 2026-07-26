import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cloneElement, useEffect, useState } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useAppForm } from "@/components/ui/form-tanstack";
import { FormWithDetector } from "@/components/forms";
import { cn } from "@/lib/utils";

export type ModalFormProps = {
  title: string;
  desc?: React.ReactNode;
  content: React.ReactElement;
  info?: React.ReactNode;
  textConfirm?: string;
  textCancel?: string;
  onConfirmClick: (body: Record<string, any>) => void | Promise<void>;
  onCancelClick?: () => void;
  modal?: boolean;
  child?: any;
  defaultValue: Record<string, any>;
  schema: any;
  headerIcon?: React.ReactNode;
  variant?: "default" | "destructive" | "confirm";
};

export type DialogModalFormProps = {
  modal?: ModalFormProps;
  onDismissOutside?: boolean;
  className?: string;
  classNameConfirm?: string;
  classNameCancel?: string;
  variantSubmit?: string;
};

export const DialogModalForm = ({
  modal = {
    title: "Title",
    desc: "Text Descriptions",
    content: <div />,
    textConfirm: "Yes",
    textCancel: "No",
    onConfirmClick: () => { },
    onCancelClick: () => { },
    modal: true,
    defaultValue: {},
    child: null,
    schema: null,
    info: null,
  },
  onDismissOutside = false,
  classNameConfirm = "",
  classNameCancel = "",
  variantSubmit = "default",
  ...props
}: DialogModalFormProps) => {
  const { t } = useAppTranslation();
  const [isOpen, setIsOpen] = useState(true);

  interface DialogContentProps {
    values?: any;
    form: any;
  }

  const form = useAppForm({
    defaultValues: modal.defaultValue,
    validators: {
      onChange: modal.schema,
    },
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (modal?.defaultValue) {
      form.reset(modal.defaultValue);
    }
  }, [JSON.stringify(modal?.defaultValue)]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          modal?.onCancelClick && modal.onCancelClick();
        }
      }}
      modal={modal?.modal}
    >
      <DialogContent
        className={cn("flex flex-col max-h-[80vh] sm:max-w-[80vw] lg:max-w-xl", props.className)}
        aria-describedby=""
      >
        <DialogHeader className={"flex flex-col"}>
          <div className="flex items-center gap-2">
            {modal?.headerIcon && <div className="flex-shrink-0">{modal.headerIcon}</div>}
            <DialogTitle>{modal?.title}</DialogTitle>
          </div>
          {modal?.desc && <DialogDescription>{modal?.desc}</DialogDescription>}
        </DialogHeader>
        <form.AppForm>
          <FormWithDetector
            form={form}
            onSubmit={(v) => modal?.onConfirmClick(v)}
            className="flex flex-col h-full flex-1 overflow-y-auto"
          >
            <div className={"flex flex-col flex-1"}>
              {modal?.child &&
                modal?.content &&
                cloneElement<DialogContentProps>(
                  modal.content as React.ReactElement<DialogContentProps>,
                  {
                    values: modal.child,
                    form,
                  },
                )}
            </div>

            {modal?.info && <div className="flex-shrink-0">{modal.info}</div>}

            <DialogFooter className="flex-shrink-0">
              <div className="w-full flex sm:flex-row flex-col gap-2 justify-end pt-4">
                <Button
                  className={cn(
                    "min-w-[80px]",
                    modal?.variant === "confirm" &&
                    "bg-emerald-600 hover:bg-emerald-700 text-white",
                  )}
                  variant={modal?.variant === "destructive" ? "destructive" : "default"}
                  type="submit"
                >
                  {modal?.textConfirm ?? t(($) => $.labels.save)}
                </Button>
                {modal.onCancelClick && (
                  <Button
                    variant="outline"
                    className="min-w-[80px]"
                    type="button"
                    onClick={() => {
                      modal.onCancelClick?.();
                      setIsOpen(false);
                    }}
                  >
                    {modal?.textCancel ?? t(($) => $.labels.cancel)}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </FormWithDetector>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};
