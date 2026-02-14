"use client"

import * as React from "react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle, Info, XCircle, HelpCircle } from "lucide-react"

export type ModernModalProps = {
    title: string
    desc?: React.ReactNode
    content?: React.ReactNode
    textConfirm?: string
    textCancel?: string
    onConfirmClick?: () => void
    onCancelClick?: () => void
    modal?: boolean
    icon?: React.ReactNode
    iconType?: "warning" | "success" | "info" | "error" | "question"
    showCloseButton?: boolean
    variant?: "default" | "destructive"
}

export type ModernDialogProps = {
    modal?: ModernModalProps
    onDismissOutside?: boolean
    className?: string
    classNameConfirm?: string
    classNameCancel?: string
    variantSubmit?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ModernDialog({
    modal = {
        title: "Notification",
        desc: "This is a notification message.",
        content: null,
        textConfirm: "OK",
        textCancel: "Cancel",
        onConfirmClick: undefined,
        onCancelClick: undefined,
        modal: true,
        icon: undefined,
        iconType: "info",
        showCloseButton: true,
        variant: "default",
    },
    onDismissOutside = true,
    className,
    classNameConfirm,
    classNameCancel,
    variantSubmit = "default",
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    ...props
}: ModernDialogProps) {
    const [internalOpen, setInternalOpen] = useState(true)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setIsOpen = controlledOnOpenChange || setInternalOpen

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open && modal?.onCancelClick) {
            modal.onCancelClick()
        }
    }

    const getIconConfig = () => {
        if (modal?.icon) return { icon: modal.icon, color: "bg-primary/10 text-primary" }

        switch (modal?.iconType) {
            case "warning":
                return {
                    icon: <AlertTriangle className="h-6 w-6" />,
                    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500"
                }
            case "success":
                return {
                    icon: <CheckCircle className="h-6 w-6" />,
                    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500"
                }
            case "error":
                return {
                    icon: <XCircle className="h-6 w-6" />,
                    color: "bg-destructive/10 text-destructive"
                }
            case "info":
                return {
                    icon: <Info className="h-6 w-6" />,
                    color: "bg-primary/10 text-primary"
                }
            case "question":
                return {
                    icon: <HelpCircle className="h-6 w-6" />,
                    color: "bg-accent/50 text-accent-foreground"
                }
            default:
                return null
        }
    }

    const iconConfig = getIconConfig()

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={modal?.modal}>
            <DialogContent
                className={cn(
                    "p-0 border-none shadow-none bg-transparent sm:max-w-[440px] w-[95vw]",
                    className
                )}
                onInteractOutside={(e) => {
                    if (!onDismissOutside) e.preventDefault()
                }}
                showCloseButton={false}
                aria-describedby={undefined}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl bg-background/90 dark:bg-background/90 backdrop-blur-2xl backdrop-saturate-150 border border-border/50 shadow-2xl ring-1 ring-border/5"
                >
                    {/* Modern decorative elements */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {/* Subtle top glow */}
                        <div className={`absolute -top-24 -left-20 w-64 h-64 rounded-full blur-3xl opacity-20 
                            ${modal?.variant === "destructive"
                                ? "bg-destructive/30"
                                : "bg-primary/30"}`}
                        />

                        {/* Subtle bottom-right glow */}
                        <div className="absolute -bottom-24 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl opacity-20" />
                    </div>

                    {/* Top Accent Line */}
                    <div className={`relative z-10 w-full h-1.5 bg-gradient-to-r 
                        ${modal?.variant === "destructive"
                            ? "from-destructive/80 via-destructive to-destructive/80"
                            : "from-primary/80 via-primary to-primary/80"}`}
                    />

                    <div className="flex flex-col items-center p-8 pb-6 text-center">
                        {/* Icon Circle */}
                        {iconConfig && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 17 }}
                                className={cn(
                                    "mb-6 p-4 rounded-2xl shadow-sm ring-1 ring-inset ring-black/5",
                                    iconConfig.color
                                )}
                            >
                                {iconConfig.icon}
                            </motion.div>
                        )}

                        <DialogHeader className="space-y-3 w-full">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                                {modal?.title}
                            </DialogTitle>
                            {modal?.desc && (
                                <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                                    {modal?.desc}
                                </DialogDescription>
                            )}
                        </DialogHeader>

                        {modal?.content && (
                            <div className="w-full mt-6 text-left bg-muted/50 rounded-lg p-4 text-sm text-foreground border border-border">
                                {modal.content}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 pt-2 pb-8 sm:justify-center gap-3">
                        <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto min-w-[280px]">
                            {modal?.textCancel && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        modal?.onCancelClick ? modal.onCancelClick() : handleOpenChange(false)
                                    }}
                                    className={cn(
                                        "w-full sm:flex-1 rounded-xl h-11 text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
                                        classNameCancel
                                    )}
                                >
                                    {modal.textCancel}
                                </Button>
                            )}

                            {modal?.textConfirm && (
                                <Button
                                    variant={modal.variant === "destructive" ? "destructive" : variantSubmit}
                                    onClick={modal?.onConfirmClick}
                                    className={cn(
                                        "w-full sm:flex-1 rounded-xl h-11 font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5",
                                        modal.variant === "destructive"
                                            ? "shadow-destructive/20"
                                            : "shadow-primary/20",
                                        classNameConfirm
                                    )}
                                >
                                    {modal.textConfirm}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
