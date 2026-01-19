import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Laptop, LucideIcon, Monitor, RefreshCw, Smartphone, Tablet, Globe } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { enUS, id } from 'date-fns/locale'
import type { UserSession } from '@/api/user-api'
import { useState } from 'react'
import { ModalProps, DialogModal } from '@/components/custom/components'

interface SessionItem {
  id: string
  expiresAt: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  token: string // Added token field
}

const getDeviceIcon = (userAgent: string | null): LucideIcon => {
  if (!userAgent) return Monitor

  const lowerUA = userAgent.toLowerCase()
  if (lowerUA.includes('mobile') || lowerUA.includes('iphone') || lowerUA.includes('android')) {
    return Smartphone
  } else if (lowerUA.includes('tablet') || lowerUA.includes('ipad')) {
    return Tablet
  } else if (lowerUA.includes('mac') || lowerUA.includes('windows') || lowerUA.includes('linux')) {
    return Laptop
  }
  return Monitor
}

const getDeviceName = (userAgent: string | null): string => {
  if (!userAgent) return 'Unknown Device'

  const lowerUA = userAgent.toLowerCase()
  if (lowerUA.includes('iphone')) return 'iPhone'
  if (lowerUA.includes('ipad')) return 'iPad'
  if (lowerUA.includes('android') && lowerUA.includes('mobile')) return 'Android Phone'
  if (lowerUA.includes('android')) return 'Android Tablet'
  if (lowerUA.includes('windows')) return 'Windows PC'
  if (lowerUA.includes('mac')) return 'Mac'
  if (lowerUA.includes('linux')) return 'Linux PC'

  return 'Unknown Device'
}

const getBrowserName = (userAgent: string | null): string => {
  if (!userAgent) return 'Unknown Browser'

  const lowerUA = userAgent.toLowerCase()
  if (lowerUA.includes('chrome') && !lowerUA.includes('edge')) {
    return 'Chrome'
  } else if (lowerUA.includes('firefox')) {
    return 'Firefox'
  } else if (lowerUA.includes('safari') && !lowerUA.includes('chrome') && !lowerUA.includes('chromium')) {
    return 'Safari'
  } else if (lowerUA.includes('edge')) {
    return 'Edge'
  } else if (lowerUA.includes('opera')) {
    return 'Opera'
  } else if (lowerUA.includes('msie') || lowerUA.includes('trident')) {
    return 'Internet Explorer'
  }
  return 'Unknown Browser'
}

const formatDateDistance = (dateString: string, locale: string) => {
  try {
    const date = parseISO(dateString)
    const dateFnsLocale = locale === 'id' ? id : enUS
    return formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocale })
  } catch {
    return 'Unknown time'
  }
}

interface SessionListProps {
  sessions?: UserSession[]
  isLoading: boolean
  isError: boolean
  currentToken: string | null
  refetch?: () => void
  onRevokeSession?: (sessionToken: string) => void
  onRevokeAllSessions?: () => void
}

export function SessionList({ sessions, isLoading, isError, currentToken, refetch, onRevokeSession, onRevokeAllSessions }: SessionListProps) {
  const { t, i18n } = useTranslation()
  const [confirmationModal, setConfirmationModal] = useState<ModalProps | null>(null);

  const handleRevokeClick = (sessionToken: string) => {
    if (!sessionToken) return
    setConfirmationModal({
      title: t("user.profile.sessions.confirmLogoutTitle"),
      desc: t("user.profile.sessions.confirmLogoutDescription"),
      textConfirm: t("user.profile.sessions.confirm"),
      textCancel: t("user.profile.sessions.cancel"),
      iconType: "question",
      onConfirmClick: () => {
        if (onRevokeSession && sessionToken) {
          onRevokeSession(sessionToken)
        }
        setConfirmationModal(null)
      },
      onCancelClick: () => {
        setConfirmationModal(null)
      }
    })
  }

  const handleRevokeAllClick = () => {
    setConfirmationModal({
      title: t("user.profile.sessions.confirmRevokeAllTitle"),
      desc: t("user.profile.sessions.confirmRevokeAllDescription"),
      textConfirm: t("user.profile.sessions.revokeAll"),
      textCancel: t("user.profile.sessions.cancel"),
      iconType: "question",
      variant: "destructive",
      onConfirmClick: () => {
        if (onRevokeAllSessions) {
          onRevokeAllSessions()
        }
        setConfirmationModal(null)
      },
      onCancelClick: () => {
        setConfirmationModal(null)
      }
    })
  }

  // Separate sessions into current and others
  const currentSession = sessions?.find(session =>
    currentToken && session.token.startsWith(currentToken)
  ) || null

  const otherSessions = sessions?.filter(session =>
    !currentToken || !session.token.startsWith(currentToken)
  ) || []

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
          <CardTitle className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight">
            {t("user.profile.sessions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 min-h-[72px] justify-between">
              <div className="flex items-center gap-4 w-full">
                <Skeleton className="size-12 rounded-lg" />
                <div className="flex flex-col justify-center space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
          <CardTitle className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight">
            {t("user.profile.sessions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 p-3 rounded-full bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {t("user.profile.sessions.errorTitle") || "Gagal Memuat Sesi"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t("user.profile.sessions.errorDescription") || "Terjadi kesalahan saat memuat sesi Anda. Silakan coba lagi."}
            </p>
            <Button
              variant="default"
              onClick={() => refetch ? refetch() : window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("user.profile.sessions.retry") || "Coba Lagi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {confirmationModal && <DialogModal modal={confirmationModal} />}

      <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
          <CardTitle className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            {t("user.profile.sessions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-0 space-y-6 w-full">
          <div className="space-y-6">
            {/* Current Session Section */}
            {currentSession && (
              <section>
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight tracking-[-0.015em] px-1 pb-3">
                  {t("user.profile.sessions.currentSession")}
                </h3>
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 min-h-[72px] justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-green-500/30"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0 size-12">
                      <Globe className="text-primary dark:text-primary-foreground h-6 w-6" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-[#212529] dark:text-white text-base font-medium leading-normal line-clamp-1">
                        {getDeviceName(currentSession.userAgent)} • {getBrowserName(currentSession.userAgent)}
                      </p>
                      <p className="text-[#6C757D] dark:text-gray-400 text-sm font-normal leading-normal line-clamp-2">
                        {currentSession.ipAddress ? `${t("user.profile.sessions.ipAddress")}: ${currentSession.ipAddress}` : t("user.profile.sessions.unknownLocation")}
                        {formatDateDistance(currentSession.createdAt, i18n.language) && ` - ${formatDateDistance(currentSession.createdAt, i18n.language)}`}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-auto sm:ml-0">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 rounded-full text-xs font-medium">
                      <div className="size-2 rounded-full bg-green-500"></div>
                      <span>{t("user.profile.sessions.thisDevice")}</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Other Sessions Section */}
            {(otherSessions && otherSessions.length > 0) && (<section>
              <div className="flex flex-row justify-between items-center pb-3">
                <h3 className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight tracking-[-0.015em] px-1">
                  {t("user.profile.sessions.otherSessions")}
                </h3>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRevokeAllClick}
                >
                  {t("user.profile.sessions.revokeAll")}
                </Button>
              </div>
              <div className="space-y-4">
                {otherSessions.map((session) => {
                  const DeviceIcon = getDeviceIcon(session.userAgent)
                  const deviceName = getDeviceName(session.userAgent)
                  const browserName = getBrowserName(session.userAgent)
                  const timeAgo = formatDateDistance(session.createdAt, i18n.language)

                  return (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 min-h-[72px] justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0 size-12">
                          <DeviceIcon className="text-primary dark:text-primary-foreground h-6 w-6" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-[#212529] dark:text-white text-base font-medium leading-normal line-clamp-1">
                            {deviceName} • {browserName}
                          </p>
                          <p className="text-[#6C757D] dark:text-gray-400 text-sm font-normal leading-normal line-clamp-2">
                            {session.ipAddress ? `${t("user.profile.sessions.ipAddress")}: ${session.ipAddress}` : t("user.profile.sessions.unknownLocation")}
                            {timeAgo && ` - ${timeAgo}`}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-auto sm:ml-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleRevokeClick(session.token)
                          }}
                        >
                          {t("user.profile.sessions.logout")}
                        </Button>
                      </div>
                    </div>
                  )
                })
                }
              </div>
            </section>)}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default SessionList