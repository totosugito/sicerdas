import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookDetailInfoCardProps {
    icon: LucideIcon | any;
    label: string;
    value?: string;
}

export function BookDetailInfoCard({
    icon: Icon,
    label,
    value,
}: BookDetailInfoCardProps) {
    if (!value) return null;
    return (
        <Card className="overflow-hidden hover:border-primary/40 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
            <CardContent className="py-4 px-6 flex flex-col gap-3">
                <div className="p-2 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-1">
                        {label}
                    </p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
