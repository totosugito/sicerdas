import { LucideIcon } from "lucide-react"

interface BookDetailInfoCardProps {
    icon: LucideIcon | any
    label: string
    value?: string
}

export function BookDetailInfoCard({ icon: Icon, label, value }: BookDetailInfoCardProps) {
    if (!value) return null
    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/50 transition-colors group">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-0.5">
                    {label}
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-200">
                    {value}
                </p>
            </div>
        </div>
    )
}
