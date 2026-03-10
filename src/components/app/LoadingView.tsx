import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingViewProps {
    title?: string;
    message?: string;
    className?: string;
}

export function LoadingView({
    title = "Memuat Data",
    message = "Mohon tunggu sejenak, kami sedang mengambil informasi untuk Anda.",
    className,
}: LoadingViewProps) {
    return (
        <div
            className={cn(
                "relative group flex flex-col items-center justify-center w-full min-h-[400px] border border-border/40 rounded-3xl bg-background/50 backdrop-blur-xl shadow-sm gap-6 p-8 overflow-hidden",
                className
            )}
        >
            {/* Modern dotted background with a subtle primary glow blob */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 bottom-0 m-auto h-[250px] w-[250px] rounded-full bg-primary/10 opacity-50 blur-[80px]"></div>
            </div>

            <div className="relative">
                {/* Outer animated ring */}
                <div className="absolute inset-0 bg-primary/15 rounded-full blur-[24px] scale-[1.5] animate-pulse"></div>

                {/* Icon Glass Container with Loader */}
                <div className="relative flex items-center justify-center h-20 w-20 bg-background/60 rounded-2xl border border-primary/20 shadow-xl backdrop-blur-md transition-all duration-500">
                    <Loader2 className="h-10 w-10 text-primary animate-spin drop-shadow-md" strokeWidth={1.5} />
                </div>
            </div>

            {/* Typography */}
            <div className="text-center max-w-[420px] space-y-2.5 z-10">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground animate-pulse leading-none">{title}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{message}</p>
            </div>

            {/* Subtle bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
    );
}
