import { ChevronLeft, ChevronRight } from "lucide-react";
import { getElementStyle } from "../utils/element-styles";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";

interface AdjacentElement {
    atomicNumber: number;
    atomicSymbol: string;
    atomicName: string;
    atomicGroup: string;
}

interface ElementNavigationProps {
    previous?: AdjacentElement;
    next?: AdjacentElement;
    theme: string;
    elementStyle?: string
}

const ElementNavigation = ({ previous, next, theme, elementStyle }: ElementNavigationProps) => {
    const navigate = useNavigate();
    const prevSymbol = previous ? getElementStyle(previous.atomicGroup, theme).element : undefined;
    const nextSymbol = next ? getElementStyle(next.atomicGroup, theme).element : undefined;

    const handlePrevElement = () => {
        if (previous) {
            navigate({
                to: AppRoute.periodicTable.elementDetail.url,
                params: { id: previous.atomicNumber.toString() }
            });
        }
    };

    const handleNextElement = () => {
        if (next) {
            navigate({
                to: AppRoute.periodicTable.elementDetail.url,
                params: { id: next.atomicNumber.toString() }
            });
        }
    };

    return (
        <div className={cn("flex items-center pt-1 pb-0.5 px-0.5 rounded-none", elementStyle)}>
            <div className="flex items-center w-full bg-card p-1 rounded-none">
            <div className="flex flex-1">
                {previous && (<div
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                    onClick={handlePrevElement}
                >
                    <ChevronLeft className="h-4 w-4" />

                    <div className="flex items-center gap-2">
                        <span className="font-mono">{previous.atomicNumber}</span>
                        <div className={cn("flex h-3 w-3 rounded-full items-center justify-center", prevSymbol || "")}>
                            <div className={cn("h-2.5 w-2.5 rounded-full border border-2", prevSymbol || "")}></div>
                        </div>
                        <span className="">{previous.atomicName.toUpperCase()}</span>
                    </div>

                </div>)}
            </div>
            <div className="h-8 w-px bg-border" />

            <div className="flex flex-1 items-center justify-end">
                {next && (<div
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                    onClick={handleNextElement}
                >
                    <div className="flex items-center gap-2">
                        <span className="">{next.atomicName.toUpperCase()}</span>
                        <div className={cn("flex h-3 w-3 rounded-full items-center justify-center", nextSymbol || "")}>
                            <div className={cn("h-2.5 w-2.5 rounded-full border border-2", nextSymbol || "")}></div>
                        </div>
                        <span className="font-mono">{next.atomicNumber}</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                </div>)}
            </div>
        </div>
        </div>
    );
};

export default ElementNavigation;