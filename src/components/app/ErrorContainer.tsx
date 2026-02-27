import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorContainerProps {
    title?: string;
    message?: string;
    buttonText?: string;
    onButtonClick?: () => void;
    className?: string;
}

export function ErrorContainer({
    title = "Terjadi Kesalahan",
    message = "Data tidak ditemukan atau terjadi kesalahan server.",
    buttonText,
    onButtonClick,
    className,
}: ErrorContainerProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center min-h-[400px] border border-border/50 rounded-xl bg-card/50 backdrop-blur-[2px] shadow-sm gap-6 p-8",
                className
            )}
        >
            <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl scale-150 animate-pulse"></div>
                <div className="relative bg-destructive/10 p-5 rounded-full border border-destructive/20 shadow-inner">
                    <AlertCircle className="h-12 w-12 text-destructive" strokeWidth={1.5} />
                </div>
            </div>

            <div className="text-center max-w-sm space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                <p className="text-muted-foreground text-sm">{message}</p>
            </div>

            {buttonText && onButtonClick && (
                <Button
                    className="mt-2 min-w-[140px] shadow-sm transition-all hover:scale-105 active:scale-95"
                    onClick={onButtonClick}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
}
