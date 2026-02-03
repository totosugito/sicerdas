/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ccoYAeAgkWu
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from "lucide-react";
import { BsQuestion } from "react-icons/bs";

export type ModalProps = {
  title: string;
  desc?: React.ReactNode;
  content?: React.ReactNode;
  textConfirm?: string;
  textCancel?: string;
  onConfirmClick?: () => void;
  onCancelClick?: () => void;
  modal?: boolean;
  icon?: React.ReactNode; // Icon to display in the dialog
  iconType?: "warning" | "success" | "info" | "error" | "question"; // Predefined icon types
  showCloseButton?: boolean; // Whether to show close button
  variant?: "default" | "destructive"; // Variant for styling
};

export type DialogModalProps = {
  modal?: ModalProps;
  onDismissOutside?: boolean;
  className?: string;
  classNameConfirm?: string;
  classNameCancel?: string;
  variantSubmit?: string;
};

export const DialogModal = ({
  modal = {
    title: "Title",
    desc: "Text Descriptions",
    content: <div />,
    textConfirm: "Yes",
    textCancel: "No",
    onConfirmClick: undefined,
    onCancelClick: undefined,
    modal: true,
    icon: undefined,
    iconType: undefined,
    showCloseButton: true,
    variant: "default",
  },
  onDismissOutside = false,
  classNameConfirm = "",
  classNameCancel = "",
  variantSubmit = "default",
  ...props
}: DialogModalProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Get the appropriate icon based on iconType
  const getIcon = () => {
    if (modal?.icon) return modal.icon;

    switch (modal?.iconType) {
      case "warning":
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-500" />;
      case "info":
        return <Info className="h-8 w-8 text-blue-500" />;
      case "question":
        return <BsQuestion className="h-8 w-8 text-yellow-500" />;
      default:
        return null;
    }
  };

  const iconElement = getIcon();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          modal?.onCancelClick?.();
        }
      }}
      modal={modal?.modal}
    >
      <DialogContent
        aria-describedby={undefined}
        onInteractOutside={(e) => {
          if (!onDismissOutside) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!onDismissOutside) e.preventDefault();
        }}
        className={cn("", props?.className)}
        showCloseButton={modal?.showCloseButton}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 0.8
          }}
        >
          <DialogHeader className="flex flex-row items-start gap-4">
            {iconElement && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="mt-0.5"
              >
                <div className="p-2 rounded-full bg-muted">
                  {iconElement}
                </div>
              </motion.div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-lg">{modal?.title}</DialogTitle>
              {modal?.desc && <DialogDescription>{modal?.desc}</DialogDescription>}
            </div>
          </DialogHeader>

          {modal?.content && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="py-4"
            >
              {modal?.content}
            </motion.div>
          )}

          {(modal?.textCancel || modal?.textConfirm) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
              <DialogFooter className="gap-3 pt-4">
                {modal?.textCancel && (
                  <Button
                    variant="outline"
                    onClick={modal?.onCancelClick}
                    className={cn("min-w-[100px]", classNameCancel)}
                  >
                    {modal.textCancel}
                  </Button>
                )}
                {modal?.textConfirm && (
                  <Button
                    variant={modal.variant === "destructive" ? "destructive" : (variantSubmit as any)}
                    onClick={modal?.onConfirmClick}
                    className={cn("min-w-[100px]", classNameConfirm)}
                  >
                    {modal.textConfirm}
                  </Button>
                )}
              </DialogFooter>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
