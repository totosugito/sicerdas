import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBookDetail } from "@/api/book/book-detail";
import { useUpdateBookRating } from "@/api/book/update-rating";
import { BookDetail } from "@/components/pages/book/book/BookDetail";
import { BookDetailSkeleton } from "@/components/pages/book/book/BookDetailSkeleton";
import { ErrorPageDetails, PageTitle } from "@/components/app";
import { AlertTriangle } from "lucide-react";
import { AppRoute } from "@/constants/app-route";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useState, useEffect, Suspense, lazy, ComponentType } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CreateContentReport } from "@/components/pages/layout/CreateContentReport";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EnumContentType } from "backend/src/db/schema/enum/enum-app";
import { useUpdateBookmark } from "@/api/book/book-bookmark";
import { useUpdateDownload, UpdateDownloadResponse } from "@/api/book/update-download";
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { DialogModal } from "@/components/custom/components";

type PDFViewerProps = ComponentType<{
  key?: React.Key;
  config: {
    src: string;
    disabledCategories?: string[];
    scroll?: { defaultStrategy: any; defaultPageGap?: number };
    theme?: { preference: "dark" | "light" };
  };
  style?: React.CSSProperties;
}>;

let ScrollStrategyVertical: any = 1;
const LazyPDFViewer = lazy(() =>
  import("@embedpdf/react-pdf-viewer").then((m) => {
    ScrollStrategyVertical = m.ScrollStrategy.Vertical;
    return { default: m.PDFViewer as unknown as PDFViewerProps };
  }),
);

export const Route = createFileRoute("/(pages)/(book)/book/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { id } = Route.useParams();
  const bookId = id.split("-")[0];
  const { data, isLoading, isError } = useBookDetail(bookId);
  const { mutate: updateBookmark } = useUpdateBookmark();
  const { mutate: updateDownload } = useUpdateDownload();
  const { mutateAsync: updateRating } = useUpdateBookRating();
  const queryClient = useQueryClient();
  const { t } = useAppTranslation();
  const { user } = useAuth();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  useEffect(() => {
    if (data?.data?.userInteraction?.bookmarked !== undefined) {
      setIsFavorite(data.data.userInteraction.bookmarked);
    }
  }, [data?.data?.userInteraction?.bookmarked]);

  const book = data?.data;

  const handleBack = () => {
    router.navigate({ to: AppRoute.book.books.url });
  };

  if (isLoading) {
    return <BookDetailSkeleton />;
  }

  if (isError || !data?.success || !book) {
    return (
      <ErrorPageDetails
        icon={AlertTriangle}
        title={data?.message || t(($) => $.book.detail.notFound)}
        description={t(($) => $.book.detail.notFoundDesc)}
        onBack={handleBack}
        backLabel={t(($) => $.book.detail.backToBooks)}
      />
    );
  }

  const handleRead = () => {
    setShowViewer(true);

    updateDownload(
      { bookId: book.bookId },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            book.downloadCount = response.data!.downloadCount;
          }
        },
      },
    );
  };

  const slug = book.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = book.pdf;
    link.target = "_blank";
    link.download = `${book.bookId}-${slug}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateDownload(
      { bookId: book.bookId },
      {
        onSuccess: (response: UpdateDownloadResponse) => {
          if (response.success && response.data) {
            book.downloadCount = response.data!.downloadCount;
          }
        },
      },
    );
  };

  const handleToggleFavorite = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    updateBookmark(
      {
        bookId: book.bookId,
        bookmarked: newFavoriteStatus,
      },
      {
        onSuccess: (response) => {
          if (!response.success) {
            setIsFavorite(!newFavoriteStatus); // Revert
            showNotifError({ title: null, message: response.message });
          } else {
            showNotifSuccess({ title: null, message: response.message });

            // Update the cache with new data
            if (book.userInteraction) {
              book.userInteraction.bookmarked = response.data.bookmarked;
            }
            book.bookmarkCount = response.data.bookmarkCount;
          }
        },
        onError: () => {
          setIsFavorite(!newFavoriteStatus); // Revert
          showNotifError({ title: null, message: t(($) => $.labels.error) });
        },
      },
    );
  };

  const handleRatingClick = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    setIsRatingDialogOpen(true);
  };

  const handleReport = () => {
    setShowReportDialog(true);
  };

  const handleRate = async (rating: number) => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    try {
      const response = await updateRating({
        bookId: book.bookId,
        rating,
      });

      if (response.success) {
        showNotifSuccess({ title: null, message: response.message });

        // Update local cache for immediate feedback
        queryClient.setQueryData(["book-detail", book.bookId.toString()], (oldResponse: any) => {
          if (!oldResponse?.data) return oldResponse;
          return {
            ...oldResponse,
            data: {
              ...oldResponse.data,
              ...response.data,
              userInteraction: {
                ...oldResponse.data.userInteraction,
                ...response.data.userInteraction,
              },
            },
          };
        });
      } else {
        showNotifError({ title: null, message: response.message });
      }
    } catch (error) {
      showNotifError({ title: null, message: t(($) => $.labels.error) });
    }
  };

  const handleLogin = () => {
    router.navigate({ to: AppRoute.auth.signIn.url });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageTitle
        title={t(($) => $.book.detail.title)}
        description={t(($) => $.book.detail.description)}
        showBack={true}
        onBack={handleBack}
      />
      <BookDetail
        book={book}
        isFavorite={isFavorite}
        onRead={handleRead}
        onDownload={handleDownload}
        onToggleFavorite={handleToggleFavorite}
        onReport={handleReport}
        onRate={handleRate}
        onRatingClick={handleRatingClick}
        isRatingDialogOpen={isRatingDialogOpen}
        onRatingDialogOpenChange={setIsRatingDialogOpen}
      />

      <CreateContentReport
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        data={{
          contentType: EnumContentType.BOOK,
          referenceId: String(book.id),
          title: book.title,
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
          onConfirmClick: handleLogin,
          onCancelClick: () => setShowLoginDialog(false),
          iconType: "info",
        }}
      />

      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className="!overflow-hidden max-w-[90vw] h-[90vh] sm:max-w-[85vw] sm:h-[85vh] w-full p-0 flex flex-col border-none sm:rounded-2xl shadow-2xl"
        >
          <DialogTitle className="sr-only">
            {t(($) => $.book.detail.pdfViewer)} - {book.title}
          </DialogTitle>
          <div
            className="relative flex-1 min-h-0 bg-slate-100 dark:bg-slate-900 "
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Suspense
              fallback={
                <div className="w-full h-full bg-slate-100 dark:bg-slate-900 animate-pulse" />
              }
            >
              <LazyPDFViewer
                key={showViewer ? `visible-${book.bookId}` : "hidden"}
                config={{
                  src: book.pdf,
                  disabledCategories: ["panel-comment", "shapes", "redaction", "security"],
                  scroll: {
                    defaultStrategy: ScrollStrategyVertical,
                    defaultPageGap: 16,
                  },
                  theme: {
                    preference: (document.documentElement.classList.contains("dark")
                      ? "dark"
                      : "light") as "dark" | "light",
                  },
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  display: "block",
                }}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
