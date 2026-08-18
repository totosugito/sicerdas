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
                "relative group flex flex-col items-center justify-center w-full min-h-[400px] border border-border/40 rounded-3xl bg-background/50 backdrop-blur-xl shadow-sm gap-6 p-8 overflow-hidden",
                className
            )}
        >
            {/* Modern dotted background with a subtle destructive glow blob */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 bottom-0 m-auto h-[250px] w-[250px] rounded-full bg-destructive/15 opacity-50 blur-[80px]"></div>
            </div>

            <div className="relative">
                {/* Outer animated ring */}
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-[24px] scale-[1.5] animate-pulse"></div>

                {/* Icon Glass Container */}
                <div className="relative flex items-center justify-center h-20 w-20 bg-background/60 rounded-2xl border border-destructive/20 shadow-xl backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <AlertCircle className="h-10 w-10 text-destructive drop-shadow-md" strokeWidth={1.5} />
                </div>
            </div>

            {/* Typography */}
            <div className="text-center max-w-[420px] space-y-2.5 z-10">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{message}</p>
            </div>

            {/* Action */}
            {buttonText && onButtonClick && (
                <Button
                    className="mt-4 z-10 rounded-full px-8 shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95 group-hover:bg-destructive group-hover:text-destructive-foreground duration-300"
                    onClick={onButtonClick}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
}
