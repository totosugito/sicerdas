import { createFileRoute } from "@tanstack/react-router";
import { useListUsers, useDeleteUser, useUpdateUser, UserItem } from "@/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app";
import { Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { DialogModal } from "@/components/custom/components";
import {
  UserTable,
  DialogUserCreate,
  DialogUserResetPassword,
  DialogUserBan,
  DialogUserAvatar,
} from "@/components/pages/users/list-users";
import { PaginationData } from "@/components/custom/table";
import { z } from "zod";

export const Route = createFileRoute("/(pages)/users/list-users")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    roles: z.array(z.string()).optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  // States for pagination, search, and sorting
  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const roles = searchParams.roles ?? [];
  const sortBy = searchParams.sortBy ?? "createdAt";
  const sortOrder = searchParams.sortOrder ?? "desc";

  // API Hooks
  const { data, isLoading } = useListUsers({
    page,
    limit,
    search,
    roles,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteUser();

  // Dialog & Modal States
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Handlers
  const handleAdd = () => {
    setSelectedUser(null);
    setShowDialog(true);
  };

  const handleEdit = (user: UserItem) => {
    setSelectedUser(user);
    setShowDialog(true);
  };

  const handleResetPassword = (user: UserItem) => {
    setSelectedUser(user);
    setShowResetPasswordDialog(true);
  };

  const handleToggleBan = (user: UserItem) => {
    setSelectedUser(user);
    setShowBanDialog(true);
  };

  const handleDelete = (user: UserItem) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleUpdateAvatar = (user: UserItem) => {
    setSelectedUser(user);
    setShowAvatarDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    deleteMutation.mutate(selectedUser.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.user.management.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["users-list"] });
        setShowDeleteDialog(false);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-start">
        <PageTitle
          title={t(($) => $.user.management.title)}
          description={<span>{t(($) => $.user.management.description)}</span>}
        />
        <Button onClick={handleAdd} className="flex-shrink-0 gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
        </Button>
      </div>

      <UserTable
        data={data as any}
        isLoading={isLoading}
        paginationData={data?.data.meta as PaginationData}
        onPaginationChange={(pagination: { page: number; limit: number }) => {
          navigate({
            search: {
              ...searchParams,
              page: pagination.page,
              limit: pagination.limit,
            },
            replace: true,
          });
        }}
        setSearch={(newSearch) => {
          navigate({
            search: {
              ...searchParams,
              search: newSearch || undefined,
              page: 1,
            },
            replace: true,
          });
        }}
        sortBy={sortBy}
        sortOrder={sortOrder as "asc" | "desc"}
        onSortChange={(newSortBy, newSortOrder) => {
          navigate({
            search: {
              ...searchParams,
              sortBy: newSortBy,
              sortOrder: newSortOrder,
              page: 1,
            },
            replace: true,
          });
        }}
        roles={roles}
        setRoles={(newRoles: any) => {
          navigate({
            search: {
              ...searchParams,
              roles: newRoles && newRoles.length > 0 ? newRoles : undefined,
              page: 1,
            },
            replace: true,
          });
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        onToggleBan={handleToggleBan}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <DialogUserCreate open={showDialog} onOpenChange={setShowDialog} user={selectedUser} />

      <DialogUserResetPassword
        open={showResetPasswordDialog}
        onOpenChange={setShowResetPasswordDialog}
        user={selectedUser}
      />

      <DialogUserBan open={showBanDialog} onOpenChange={setShowBanDialog} user={selectedUser} />

      <DialogUserAvatar
        open={showAvatarDialog}
        onOpenChange={setShowAvatarDialog}
        user={selectedUser}
      />

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.user.management.delete.confirmTitle),
          desc: t(($) => $.user.management.delete.confirmDesc, { name: selectedUser?.name }),
          infoContainer: t(($) => $.user.management.delete.deleteInfo),
          infoContainerVariant: "error",
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          textCancel: t(($) => $.labels.cancel),
          textConfirm: t(($) => $.labels.delete),
          onConfirmClick: confirmDelete,
        }}
      />
    </div>
  );
}
