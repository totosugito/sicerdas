
export const BookDetailSkeleton = () => {
    return (
        <div className="container mx-auto p-6 max-w-7xl animate-pulse space-y-8">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="w-full lg:w-1/3 aspect-[2/3] bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                <div className="flex-1 space-y-6">
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    <div className="space-y-2 pt-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
