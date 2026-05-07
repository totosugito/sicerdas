import { DialogModalForm, ModalFormProps } from "@/components/custom/components";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { ControlForm } from "@/components/custom/forms";
import {
  UserItem,
  useCreateUser,
  useUpdateUser,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/api/users/admin";
import { EnumUserRole } from "backend/src/db/schema/user/types";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export type DialogUserCreateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserItem | null;
};

const FormUser = ({ values, form }: any) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <ControlForm form={form} item={values.name} showMessage={false} />
      <ControlForm form={form} item={values.email} showMessage={false} />
      <ControlForm form={form} item={values.role} showMessage={false} />
      {!form.getValues("id") && (
        <ControlForm form={form} item={values.password} showMessage={false} />
      )}
    </div>
  );
};

export const DialogUserCreate = ({ open, onOpenChange, user }: DialogUserCreateProps) => {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const formSchema = {
    name: z.string().min(
      1,
      t(($) => $.user.profile.information.fullNameError),
    ),
    email: z
      .string()
      .email(t(($) => $.user.profile.information.emailError))
      .min(
        1,
        t(($) => $.labels.required),
      ),
    role: z.string().min(
      1,
      t(($) => $.labels.required),
    ),
    password: user
      ? z.string().optional()
      : z.string().min(
          6,
          t(($) => $.user.profile.security.passwordMinLengthError),
        ),
  };

  const formConfig = {
    name: {
      type: "text",
      name: "name",
      label: t(($) => $.user.profile.information.fullName),
      placeholder: t(($) => $.user.profile.information.fullNamePlaceholder),
      required: true,
    },
    email: {
      type: "email",
      name: "email",
      label: t(($) => $.user.profile.information.emailAddress),
      placeholder: t(($) => $.user.profile.information.emailPlaceholder),
      required: true,
      // disabled: !!user,
    },
    role: {
      type: "select",
      name: "role",
      label: t(($) => $.labels.role),
      options: Object.values(EnumUserRole).map((role) => ({
        value: role,
        label: role.charAt(0).toUpperCase() + role.slice(1),
      })),
      required: true,
    },
    password: {
      type: "password",
      name: "password",
      label: t(($) => $.labels.password),
      placeholder: "******",
      required: !user,
    },
  };

  const modalProps: ModalFormProps = {
    title: user
      ? t(($) => $.user.management.dialog.editTitle)
      : t(($) => $.user.management.dialog.addTitle),
    desc: user
      ? t(($) => $.user.management.dialog.editDescription)
      : t(($) => $.user.management.dialog.addDescription),
    modal: true,
    textConfirm:
      createMutation.isPending || updateMutation.isPending
        ? t(($) => $.labels.saving)
        : t(($) => $.labels.save),
    textCancel: t(($) => $.labels.cancel),
    defaultValue: {
      id: user?.id || "",
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "",
      password: "",
    },
    child: formConfig,
    schema: formSchema,
    content: <FormUser />,
    onCancelClick: () => onOpenChange(false),
    onConfirmClick: async (values) => {
      try {
        if (user) {
          const { password, ...updateData } = values as any;
          await updateMutation.mutateAsync({ id: user.id, ...updateData } as UpdateUserRequest, {
            onSuccess: (res) => {
              showNotifSuccess({
                message: res.message || t(($) => $.user.management.notifications.updateSuccess),
              });
              queryClient.invalidateQueries({ queryKey: ["users-list"] });
              onOpenChange(false);
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.labels.error) });
            },
          });
        } else {
          await createMutation.mutateAsync(values as CreateUserRequest, {
            onSuccess: (res) => {
              showNotifSuccess({
                message: res.message || t(($) => $.user.management.notifications.createSuccess),
              });
              queryClient.invalidateQueries({ queryKey: ["users-list"] });
              onOpenChange(false);
            },
            onError: (err: any) => {
              showNotifError({ message: err.message || t(($) => $.labels.error) });
            },
          });
        }
      } catch (e) {
        // Error handled by mutation onError
      }
    },
  };

  if (!open) return null;

  return <DialogModalForm modal={modalProps} className="max-h-lg sm:max-w-lg lg:max-w-lg" />;
};
