import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import { UserItem, useResetPassword } from "@/api/users/admin";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type DialogUserResetPasswordProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
};

const FormPasswordReset = ({ values, form }: any) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <ControlForm form={form} item={values.newPassword} showMessage={false} />
      <ControlForm form={form} item={values.confirmPassword} showMessage={false} />
    </div>
  );
};

export const DialogUserResetPassword = ({
  open,
  onOpenChange,
  user,
}: DialogUserResetPasswordProps) => {
  const { t } = useAppTranslation();
  const resetMutation = useResetPassword();

  const formSchema = z
    .object({
      newPassword: z.string().min(
        6,
        t(($) => $.user.profile.security.passwordMinLengthError),
      ),
      confirmPassword: z.string().min(
        1,
        t(($) => $.user.profile.security.confirmPasswordPlaceholder),
      ),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t(($) => $.user.profile.security.passwordMismatchError),
      path: ["confirmPassword"],
    });

  const formConfig = {
    newPassword: {
      type: "password",
      name: "newPassword",
      label: t(($) => $.user.profile.security.newPassword),
      placeholder: "******",
      required: true,
    },
    confirmPassword: {
      type: "password",
      name: "confirmPassword",
      label: t(($) => $.user.profile.security.confirmPassword),
      placeholder: "******",
      required: true,
    },
  };

  const modalProps: ModalFormProps = {
    title: t(($) => $.user.management.dialog.resetPasswordTitle),
    desc: t(($) => $.user.management.dialog.resetPasswordDesc, { name: user?.name }),
    modal: true,
    textConfirm: resetMutation.isPending ? t(($) => $.labels.saving) : t(($) => $.labels.confirm),
    textCancel: t(($) => $.labels.cancel),
    defaultValue: {
      newPassword: "",
      confirmPassword: "",
    },
    child: formConfig,
    schema: formSchema,
    content: <FormPasswordReset />,
    onCancelClick: () => onOpenChange(false),
    onConfirmClick: async (values) => {
      if (!user) return;

      await resetMutation.mutateAsync(
        { id: user.id, newPassword: values.newPassword },
        {
          onSuccess: (res) => {
            showNotifSuccess({
              message:
                res.message || t(($) => $.user.management.notifications.resetPasswordSuccess),
            });
            onOpenChange(false);
          },
          onError: (err: any) => {
            showNotifError({ message: err.message || t(($) => $.labels.error) });
          },
        },
      );
    },
  };

  if (!open || !user) return null;

  return <DialogModalForm modal={modalProps} className="max-h-lg sm:max-w-lg lg:max-w-lg" />;
};
