import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useDetailPackageClient, useRatePackage, useBookmarkPackage } from "@/api/exam-packages";
import { useListPackageSectionsClient } from "@/api/exam-package-sections";
import {
  PackageDetailHero,
  PackageDetailInfo,
  PackageSectionAccordion,
  PackageRatingDialog,
  PackageDetailSkeleton,
} from "@/components/pages/exam/packages/detail-package";
import { AppRoute } from "@/constants/app-route";
import { ErrorPageDetails, PageTitle } from "@/components/app";
import { useAppTranslation } from "@/lib/i18n-typed";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { CreateContentReport } from "@/components/pages/layout/CreateContentReport";
import { EnumContentType } from "backend/src/db/schema/enum/enum-app";
import { DialogModal } from "@/components/custom/components";

export const Route = createFileRoute("/(pages)/exam/(packages)/package/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { t } = useAppTranslation();
  const { user } = useAuth();

  // Fetch Package Detail
  const {
    data: detailRes,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useDetailPackageClient({ id });

  // Fetch Section List
  const {
    data: sectionsRes,
    isLoading: isSectionsLoading,
    isError: isSectionsError,
  } = useListPackageSectionsClient({ packageId: id });

  // Mutation Hooks
  const { mutate: updateBookmark } = useBookmarkPackage();
  const { mutateAsync: ratePackage } = useRatePackage();

  // Local UI State
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Sync favorite state
  useEffect(() => {
    if (detailRes?.data?.userInteraction) {
      setIsFavorite(detailRes.data.userInteraction.bookmarked);
    }
  }, [detailRes?.data?.userInteraction]);

  const isLoading = isDetailLoading || isSectionsLoading;
  const isError = isDetailError || isSectionsError;

  const handleBack = () => {
    router.navigate({ to: AppRoute.exam.exams.url });
  };

  const toggleFavorite = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const pkg = detailRes?.data;
    if (!pkg) return;

    const nextStatus = !isFavorite;
    setIsFavorite(nextStatus);

    updateBookmark(
      { packageId: pkg.id, bookmarked: nextStatus },
      {
        onSuccess: (res) => {
          if (!res.success) {
            setIsFavorite(!nextStatus);
            showNotifError({ message: res.message });
          } else {
            showNotifSuccess({ message: res.message });
            refetchDetail();
          }
        },
        onError: () => {
          setIsFavorite(!nextStatus);
          showNotifError({ message: t(($) => $.labels.error) });
        },
      },
    );
  };

  const handleRate = async (rating: number) => {
    const pkg = detailRes?.data;
    if (!pkg) return;

    try {
      const res = await ratePackage({ packageId: pkg.id, rating });
      if (res.success) {
        showNotifSuccess({ message: res.message });
        refetchDetail();
      } else {
        showNotifError({ message: res.message });
      }
    } catch (err) {
      showNotifError({ message: t(($) => $.labels.error) });
    }
  };

  const startExam = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    showNotifSuccess({ message: "Memulai persiapan ujian..." });
  };

  if (isLoading) {
    return <PackageDetailSkeleton />;
  }

  if (isError || !detailRes?.success || !detailRes?.data) {
    return (
      <ErrorPageDetails
        icon={AlertCircle}
        title={t(($) => $.exam.packages.detail.notFound)}
        description={
          detailRes?.message || (detailError as any)?.message || t(($) => $.labels.error)
        }
        onRetry={() => refetchDetail()}
        onBack={handleBack}
        retryLabel={t(($) => $.labels.retry)}
        backLabel={t(($) => $.labels.back)}
      />
    );
  }

  const pkg = detailRes.data;
  const sections = sectionsRes?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={t(($) => $.exam.packages.detail.title)}
        description={t(($) => $.exam.packages.detail.description)}
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex w-full flex-col gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-6">
          <PackageDetailHero
            pkg={pkg}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onReport={() => setShowReportDialog(true)}
            onRatingClick={() => (user ? setShowRatingDialog(true) : setShowLoginDialog(true))}
          />

          <PackageDetailInfo pkg={pkg} />

          <div className="pt-4 border-t">
            <PackageSectionAccordion sections={sections} onTakeExam={(sectionId) => startExam()} />
          </div>
        </div>

        {/* Dialogs */}
        <PackageRatingDialog
          isOpen={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          onRate={handleRate}
          initialRating={pkg.userInteraction?.rating || 0}
          packageTitle={pkg.title}
        />

        <CreateContentReport
          isOpen={showReportDialog}
          onOpenChange={setShowReportDialog}
          data={{
            contentType: EnumContentType.EXAM,
            referenceId: pkg.id,
            title: pkg.title,
            name: user?.user?.name || "",
            email: user?.user?.email || "",
          }}
        />

        <DialogModal
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          modal={{
            title: t(($) => $.labels.loginRequired),
            desc: t(($) => $.labels.loginRequiredDesc),
            textConfirm: t(($) => $.labels.login),
            textCancel: t(($) => $.labels.cancel),
            onConfirmClick: () => router.navigate({ to: AppRoute.auth.signIn.url }),
            onCancelClick: () => setShowLoginDialog(false),
            iconType: "info",
          }}
        />
      </div>
    </div>
  );
}
