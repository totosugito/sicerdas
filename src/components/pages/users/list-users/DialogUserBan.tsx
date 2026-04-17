import { UserItem, useBanUser } from "@/api/users";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { DialogModalForm } from "@/components/custom/components";
import { ControlForm } from "@/components/custom/forms";
import { UserCheck, UserX, Info } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface DialogUserBanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
}

const FormBan = ({ values, form }: any) => {
  return (
    <div className="flex flex-col gap-4 w-full pt-4">
      {!values.banReason.hidden && <ControlForm form={form} item={values.banReason} />}
    </div>
  );
};

export function DialogUserBan({ open, onOpenChange, user }: DialogUserBanProps) {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const banMutation = useBanUser();

  const isBanning = user && !user.banned;

  if (!open || !user) return null;

  const handleConfirm = (data: any) => {
    if (!user) return;

    banMutation.mutate(
      {
        id: user.id,
        banned: !user.banned,
        banReason: !user.banned ? data.banReason : undefined,
      },
      {
        onSuccess: (res) => {
          const message = user.banned
            ? t(($) => $.user.management.notifications.unbanSuccess)
            : t(($) => $.user.management.notifications.banSuccess);

          showNotifSuccess({ message: res.message || message });
          queryClient.invalidateQueries({ queryKey: ["users-list"] });
          onOpenChange(false);
        },
        onError: (err: any) => {
          showNotifError({ message: err.message || t(($) => $.labels.error) });
        },
      },
    );
  };

  const formConfig = {
    banReason: {
      name: "banReason",
      label: t(($) => $.user.management.dialog.banReason),
      placeholder: t(($) => $.user.management.dialog.banReasonPlaceholder),
      type: "textarea",
      hidden: !isBanning,
    },
  };

  const renderDescription = () => {
    const str = isBanning
      ? t(($) => $.user.management.dialog.banConfirmDesc)
      : t(($) => $.user.management.dialog.unbanConfirmDesc);

    const parts = str.split("{{name}}");
    if (parts.length < 2) return str;

    return (
      <span className="text-muted-foreground leading-relaxed">
        {parts[0]}
        <span
          className={cn(
            "inline-flex font-bold px-1.5 py-0.25 rounded border shadow-sm mx-1 min-w-[30px] justify-center items-center transition-all",
            isBanning
              ? "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 shadow-red-500/5"
              : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 shadow-emerald-500/5",
          )}
        >
          {user?.name}
        </span>
        {parts[1]}
      </span>
    );
  };

  return (
    <DialogModalForm
      modal={{
        title: isBanning
          ? t(($) => $.user.management.dialog.banConfirmTitle)
          : t(($) => $.user.management.dialog.unbanConfirmTitle),
        desc: renderDescription(),
        headerIcon: isBanning ? (
          <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
        ) : (
          <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        ),
        variant: isBanning ? "destructive" : "confirm",
        textConfirm: isBanning
          ? t(($) => $.user.management.dialog.banTitle)
          : t(($) => $.user.management.dialog.unbanTitle),
        schema: isBanning
          ? z.object({
              banReason: z.string().optional(),
            })
          : z.object({}),
        defaultValue: {
          banReason: user?.banReason || "",
        },
        child: formConfig,
        content: <FormBan />,
        info: isBanning && (
          <div className="flex gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-200/50 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300 text-xs mt-2">
            <Info className="h-4 w-4 shrink-0" />
            <p className="leading-normal">{t(($) => $.user.management.dialog.banInfo)}</p>
          </div>
        ),
        onConfirmClick: handleConfirm,
        onCancelClick: () => onOpenChange(false),
      }}
      className="max-h-lg sm:max-w-lg lg:max-w-lg"
    />
  );
}
