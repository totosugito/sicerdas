import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {cloneElement, useEffect, useState} from "react";
import * as React from "react";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {useTranslation} from "react-i18next";
import {Form} from "@/components/ui/form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

export type ModalFormProps = {
  title: string;
  desc?: React.ReactNode;
  content: React.ReactElement;
  info?: React.ReactNode;
  textConfirm?: string;
  textCancel?: string;
  onConfirmClick: (body: Record<string, any>) => void;
  onCancelClick?: () => void;
  modal?: boolean;
  child?: any;
  defaultValue: Record<string, any>;
  schema: any;
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
                             content: <div/>,
                             textConfirm: "Yes",
                             textCancel: "No",
                             onConfirmClick: () => {
                             },
                             onCancelClick: () => {
                             },
                             modal: true,
                             defaultValue: {},
                             child: null,
                             schema: null,
                             info: null
                           },
                           onDismissOutside = false,
                           classNameConfirm = "",
                           classNameCancel = "",
                           variantSubmit = "default",
                           ...props
                         }: DialogModalFormProps) => {
  const {t} = useTranslation();
  const [isOpen, setIsOpen] = useState(true); // Keep the dialog open

  // First, define the expected props type for the content component
  interface DialogContentProps {
    values?: any;  // Replace 'any' with a more specific type if possible
    form: ReturnType<typeof useForm>;  // Or a more specific form type
  }

  const form = useForm({
    resolver: zodResolver(z.object(modal.schema)),
    defaultValues: modal.defaultValue,
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (modal?.defaultValue) {
      form.reset(modal.defaultValue);
    }
  }, [modal]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        modal?.onCancelClick && modal.onCancelClick()
      }
    }} modal={modal?.modal}>
      <DialogContent
        className="flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby=""
      >
        <DialogHeader className={"flex flex-col"}>
          <DialogTitle>{modal?.title}</DialogTitle>
          {modal?.desc && <DialogDescription>{modal?.desc}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v: Record<string, any>) => {
            modal?.onConfirmClick(v)
          })} className={"flex flex-col h-full flex-1 overflow-y-auto"}>
            <div className={"flex flex-col h-full flex-1 overflow-y-auto"}>
              {(modal?.child && modal?.content) &&
                cloneElement<DialogContentProps>(modal.content as React.ReactElement<DialogContentProps>, {
                  values: modal.child,
                  form
                })
              }
            </div>

            {modal?.info && <div className="flex-shrink-0">
              {modal.info}
            </div>}

            <DialogFooter className="flex-shrink-0">
              <div className="w-full flex sm:flex-row flex-col gap-2 justify-end pt-4">
                <Button className="min-w-[80px]" type="submit">
                  {modal?.textConfirm ?? t("shared.save")}
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
                    {modal?.textCancel ?? t("shared.cancel")}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}