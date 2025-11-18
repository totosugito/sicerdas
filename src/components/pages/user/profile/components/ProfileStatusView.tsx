import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ProfileHeader } from '@/components/pages/user/profile'
import { AlertCircle, User } from 'lucide-react'

interface ProfileLoadingViewProps {
    isLoading?: boolean
}

export function ProfileLoadingView({ isLoading = true }: ProfileLoadingViewProps) {
    const { t } = useTranslation()

    if (!isLoading) return null

    return (
        <div className="flex flex-col gap-6 w-full">
            <ProfileHeader />

            <div className="grid md:grid-cols-[220px_minmax(0px,_1fr)] max-w-6xl gap-x-6 w-full">
                {/* Navigation Tabs Skeleton */}
                <div className="md:col-span-1 w-full">
                    <div className="bg-card border rounded-xl p-4 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="w-full">
                    <div className="flex flex-col gap-6">
                        {/* Profile info skeleton */}
                        <div className="bg-card border rounded-xl p-6">
                            <div className="flex flex-col gap-6">
                                <div className='flex flex-row gap-6'>
                                    <Skeleton className="w-24 h-24 rounded-full" />
                                    <div className="flex-1 space-y-4">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                </div>
                                <Skeleton className="h-20 w-full" />
                                <div className="flex gap-2 pt-2 justify-end">
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ProfileErrorViewProps {
    isError?: boolean
}

export function ProfileErrorView({ isError = true }: ProfileErrorViewProps) {
    const { t } = useTranslation()

    if (!isError) return null

    return (
        <div className="flex flex-col gap-6 w-full">
            <ProfileHeader />

            <div className="grid md:grid-cols-[220px_minmax(0px,_1fr)] max-w-6xl gap-x-6 w-full">
                {/* Navigation Tabs Skeleton */}
                <div className="md:col-span-1 w-full">
                    <div className="bg-card border rounded-xl p-4 space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>

                {/* Error Content */}
                <div className="w-full">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-full max-w-md">
                            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                                <AlertCircle className="h-5 w-5" />
                                <AlertTitle className="text-destructive">
                                    {t("user.profile.errorTitle")}
                                </AlertTitle>
                                <AlertDescription className="text-destructive/80">
                                    {t("user.profile.errorDescription")}
                                </AlertDescription>
                            </Alert>

                            <div className="mt-8 flex flex-col items-center">
                                <div className="bg-muted rounded-full p-4 mb-4">
                                    <User className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {t("user.profile.unableToLoad")}
                                </h3>
                                <p className="text-muted-foreground text-center mb-6">
                                    {t("user.profile.tryAgainLater")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}