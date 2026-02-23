import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LongTextProps {
    text: string;
    title?: string;
    maxChars?: number;
    maxLines?: number;
    className?: string;
    contentClassName?: string;
    maxHeight?: string | number;
    isHtml?: boolean;
}

export const LongText: React.FC<LongTextProps> = ({
    text = "",
    title,
    maxChars = 80,
    maxLines = 2,
    className,
    contentClassName,
    maxHeight = 400,
    isHtml = false
}) => {
    // Truncate text based on maxChars
    const truncateText = (text: string, maxChars: number) => {
        if (text.length <= maxChars) return text;
        return text.substring(0, maxChars) + '...';
    };

    const shouldTruncate = text.length > maxChars;
    const displayText = shouldTruncate ? truncateText(text, maxChars) : text;

    return (
        <div className={cn("text-left", className)}>
            {shouldTruncate ? (
                <>
                    {isHtml ? (
                        <span dangerouslySetInnerHTML={{ __html: displayText }} />
                    ) : (
                        displayText
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <span
                                className="text-blue-500 hover:underline cursor-pointer ml-1"
                            >
                                More
                            </span>
                        </PopoverTrigger>
                        <PopoverContent
                            className={cn("w-80 p-0 flex flex-col", contentClassName)}
                            style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
                        >
                            {title && (
                                <div className="px-4 py-2.5 border-b font-semibold text-sm bg-muted/30 sticky top-0 z-10 backdrop-blur-sm rounded-t-lg truncate" title={title}>
                                    {title}
                                </div>
                            )}
                            <div className="p-4 overflow-y-auto flex-1 scrollbar-thin">
                                {isHtml ? (
                                    <div dangerouslySetInnerHTML={{ __html: text }} />
                                ) : (
                                    <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{text}</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </>
            ) : (
                <>{isHtml ? <span dangerouslySetInnerHTML={{ __html: displayText }} /> : displayText}</>
            )}
        </div>
    );
};