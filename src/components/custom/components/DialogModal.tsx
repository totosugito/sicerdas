"use client"

import * as React from "react"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, XCircle, HelpCircle, LucideIcon } from "lucide-react"

export type DialogInfoItem = {
    text: string
    icon?: React.ReactNode
}

export type ModalProps = {
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
    // New props for the modern style
    headerIcon?: React.ReactNode
    headerIconBgColor?: string
    infoTitle?: string
    infoItems?: DialogInfoItem[]
    showInfoSection?: boolean
    infoContainer?: string
    infoContainerVariant?: "warning" | "success" | "info" | "error" | "default"
    infoContainerClassName?: string
    maxWidth?: "sm" | "md" | "lg" | "xl"
}

export type DialogModalProps = {
    modal?: ModalProps
    onDismissOutside?: boolean
    className?: string
    classNameContent?: string
    classNameConfirm?: string
    classNameCancel?: string
    classNameHeader?: string
    classNameBody?: string
    classNameInfoSection?: string
    variantSubmit?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
    children?: React.ReactNode
}

export function DialogModal({
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
        headerIcon: undefined,
        headerIconBgColor: undefined,
        infoTitle: undefined,
        infoItems: undefined,
        showInfoSection: false,
        infoContainer: undefined,
        infoContainerVariant: "info",
        infoContainerClassName: undefined,
        maxWidth: "sm",
    },
    onDismissOutside = true,
    className,
    classNameContent,
    classNameConfirm,
    classNameCancel,
    classNameHeader,
    classNameBody,
    classNameInfoSection,
    variantSubmit = "default",
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    trigger,
    children,
    ...props
}: DialogModalProps) {
    const [internalOpen, setInternalOpen] = useState(true)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setIsOpen = controlledOnOpenChange || setInternalOpen

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open && modal?.onCancelClick) {
            modal.onCancelClick()
        }
    }

    const getDefaultIcon = () => {
        switch (modal?.iconType) {
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-amber-600" />
            case "success":
                return <CheckCircle className="h-5 w-5 text-emerald-600" />
            case "error":
                return <XCircle className="h-5 w-5 text-destructive" />
            case "info":
                return <Info className="h-5 w-5 text-primary" />
            case "question":
                return <HelpCircle className="h-5 w-5 text-accent-foreground" />
            default:
                return <Info className="h-5 w-5 text-primary" />
        }
    }

    const getDefaultIconBgColor = () => {
        if (modal?.headerIconBgColor) return modal.headerIconBgColor

        switch (modal?.iconType) {
            case "warning":
                return "bg-amber-100 dark:bg-amber-900/30"
            case "success":
                return "bg-emerald-100 dark:bg-emerald-900/30"
            case "error":
                return "bg-destructive/10"
            case "info":
                return "bg-primary/10"
            case "question":
                return "bg-accent/50"
            default:
                return "bg-primary/10"
        }
    }

    const getMaxWidth = () => {
        switch (modal?.maxWidth) {
            case "sm":
                return "max-w-sm"
            case "md":
                return "max-w-md"
            case "lg":
                return "max-w-lg"
            case "xl":
                return "max-w-xl"
            default:
                return "max-w-sm"
        }
    }

    const headerIcon = modal?.headerIcon || (modal?.variant === "destructive" ? <XCircle className="h-5 w-5 text-destructive" /> : getDefaultIcon())
    const headerIconBg = modal?.variant === "destructive" ? "bg-destructive/10" : getDefaultIconBgColor()

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

            <AlertDialogContent className={cn(getMaxWidth(), "p-0 overflow-hidden shadow-2xl", classNameContent, className)}>
                {/* Header */}
                <div className={cn("px-6 pt-6 pb-2 text-center", classNameHeader)}>
                    <div className={cn("mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl", headerIconBg)}>
                        {headerIcon}
                    </div>
                    <AlertDialogTitle className="text-foreground text-xl font-bold tracking-tight">
                        {modal?.title}
                    </AlertDialogTitle>
                    {modal?.desc && (
                        <AlertDialogDescription className="text-muted-foreground mt-2 text-base">
                            {modal.desc}
                        </AlertDialogDescription>
                    )}
                </div>

                {/* Body */}
                <div className={cn("px-6 pb-5 space-y-4", classNameBody)}>
                    {/* Custom Content */}
                    {modal?.content && (
                        <div className="w-full">
                            {modal.content}
                        </div>
                    )}

                    {/* Info Container (String only) */}
                    {modal?.infoContainer && (
                        <div className={cn(
                            "rounded-xl border p-3.5 text-center",
                            modal?.infoContainerVariant === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                                modal?.infoContainerVariant === "success" ? "border-emerald-500/20 bg-emerald-500/5" :
                                    modal?.infoContainerVariant === "error" ? "border-destructive/20 bg-destructive/5" :
                                        "border-primary/20 bg-primary/5",
                            modal?.infoContainerClassName,
                            classNameInfoSection
                        )}>
                            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                                {modal.infoContainer}
                            </p>
                        </div>
                    )}

                    {/* Info Section */}
                    {modal?.showInfoSection && modal?.infoItems && modal.infoItems.length > 0 && (
                        <div className={cn("rounded-xl border border-border bg-secondary/50 p-4 space-y-2.5 mb-6", classNameInfoSection)}>
                            {modal?.infoTitle && (
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {modal.infoTitle}
                                </p>
                            )}
                            <div className="space-y-2">
                                {modal.infoItems.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                                        {item.icon || (
                                            <div className={cn(
                                                "mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0",
                                                modal?.variant === "destructive" ? "bg-destructive" : "bg-primary"
                                            )} />
                                        )}
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Children (for custom content) */}
                    {children}

                    {/* Footer Buttons */}
                    <AlertDialogFooter className="flex-row gap-2 sm:justify-stretch">
                        {modal?.textCancel && (
                            <AlertDialogCancel
                                className={cn("flex-1 h-9", classNameCancel)}
                                onClick={modal?.onCancelClick}
                            >
                                {modal.textCancel}
                            </AlertDialogCancel>
                        )}
                        {modal?.textConfirm && (
                            <AlertDialogAction
                                className={cn(
                                    "flex-1 h-9 shadow-md",
                                    modal?.variant === "destructive"
                                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/25"
                                        : "shadow-primary/25",
                                    classNameConfirm
                                )}
                                onClick={modal?.onConfirmClick}
                            >
                                {modal.textConfirm}
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
