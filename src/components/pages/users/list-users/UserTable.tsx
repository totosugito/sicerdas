import { UserItem, ListUsersResponse } from "@/api/users";
import {
  DataTable,
  useDataTable,
  DataTableFilter,
  createRowNumberColumn,
  DataTableColumnHeader,
  PaginationData,
} from "@/components/custom/table";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  KeyRound,
  Filter,
  ShieldCheck,
  User as UserIcon,
  GraduationCap,
  CheckCircle2,
  Ban,
  UserX,
  UserCheck,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { string_to_locale_date } from "@/lib/my-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Faceted,
  FacetedBadgeList,
  FacetedContent,
  FacetedGroup,
  FacetedItem,
  FacetedList,
  FacetedTrigger,
} from "@/components/ui/faceted";
import { EnumUserRole } from "backend/src/db/schema/user/types";
import { cn } from "@/lib/utils";

interface UserTableProps {
  data: ListUsersResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  setSearch: (search: string) => void;
  roles: string[];
  setRoles: (roles: string[]) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onEdit: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
  onResetPassword: (user: UserItem) => void;
  onToggleBan: (user: UserItem) => void;
  onUpdateAvatar: (user: UserItem) => void;
}

export function UserTable({
  data,
  isLoading,
  paginationData,
  onPaginationChange,
  setSearch,
  roles,
  setRoles,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleBan,
  onUpdateAvatar,
}: UserTableProps) {
  const { t } = useAppTranslation();

  const roleOptions = Object.values(EnumUserRole).map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  }));

  const columns: ColumnDef<UserItem>[] = [
    createRowNumberColumn<UserItem>({
      id: "no",
      size: 50,
      paginationData: paginationData,
    }),
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t(($) => $.labels.fullName)} />
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const email = row.original.email;
        const image = row.original.image;

        return (
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9 border border-border/50 shrink-0">
              <AvatarImage src={image} alt={name} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xs uppercase">
                {name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground truncate max-w-[180px]">{name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[180px]">{email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t(($) => $.labels.role)} />
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;

        let icon = <UserIcon className="h-3 w-3 mr-1" />;
        let colorClass = "bg-muted/50 border-muted-foreground/20 text-muted-foreground";

        if (role === "admin") {
          icon = <ShieldCheck className="h-3 w-3 mr-1" />;
          colorClass = "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
        } else if (role === "teacher") {
          icon = <GraduationCap className="h-3 w-3 mr-1" />;
          colorClass = "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
        } else if (role === "user") {
          colorClass =
            "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
        }

        return (
          <Badge
            variant="outline"
            className={cn("px-2 py-1 font-medium rounded-md capitalize", colorClass)}
          >
            {icon}
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t(($) => $.labels.status)} />
      ),
      cell: ({ row }) => {
        const isBanned = row.getValue("banned") as boolean;
        const colorClass = isBanned
          ? "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50 dark:text-red-400"
          : "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50 dark:text-emerald-400";

        const dotColor = isBanned ? "bg-red-500" : "bg-emerald-500";
        const label = isBanned ? t(($) => $.labels.banned) : t(($) => $.labels.active);

        return (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider",
              colorClass,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
            <span>{label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t(($) => $.labels.updatedAt)} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {string_to_locale_date("id-ID", row.getValue("updatedAt"))}
        </span>
      ),
    },
    {
      id: "actions",
      minSize: 50,
      maxSize: 50,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t(($) => $.labels.actions)}
          className="justify-center"
        />
      ),
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t(($) => $.labels.actions)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t(($) => $.labels.edit)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResetPassword(user)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {t(($) => $.labels.resetPassword)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateAvatar(user)}>
                  <Camera className="mr-2 h-4 w-4" />
                  {t(($) => $.user.management.dialog.changeAvatarTitle)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleBan(user)}>
                  {user.banned ? (
                    <>
                      <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                      <span>{t(($) => $.user.management.dialog.unbanTitle)}</span>
                    </>
                  ) : (
                    <>
                      <UserX className="mr-2 h-4 w-4 text-red-600" />
                      <span>{t(($) => $.user.management.dialog.banTitle)}</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(user)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t(($) => $.labels.delete)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const { table } = useDataTable({
    data: data?.data.items || [],
    columns,
    pageCount: paginationData?.totalPages || -1,
    initialState: {
      pagination: {
        pageIndex: (paginationData?.page || 1) - 1,
        pageSize: paginationData?.limit || 10,
      },
      sorting: [
        {
          id: sortBy,
          desc: sortOrder === "desc",
        },
      ],
    },
    manualSorting: true,
    onSortingChange: (updater: any) => {
      const nextSorting =
        typeof updater === "function" ? updater(table.getState().sorting) : updater;
      if (nextSorting && nextSorting.length > 0) {
        onSortChange(nextSorting[0].id, nextSorting[0].desc ? "desc" : "asc");
      } else {
        onSortChange("createdAt", "desc");
      }
    },
    manualPagination: true,
    onPaginationChange: (updater: any) => {
      const nextPagination =
        typeof updater === "function" ? updater(table.getState().pagination) : updater;
      if (onPaginationChange) {
        onPaginationChange({
          page: nextPagination.pageIndex + 1,
          limit: nextPagination.pageSize,
        });
      }
    },
    manualFiltering: true,
    onGlobalFilterChange: (searchValue: any) => {
      setSearch(searchValue);
    },
  });

  return (
    <div className="flex flex-col gap-4 border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      <div
        className={
          "flex flex-col sm:flex-row gap-4 justify-between px-4 py-4 bg-muted/30 border-b border-border"
        }
      >
        <div className="flex items-center gap-2">
          <Faceted value={roles} onValueChange={(val) => setRoles(val || [])} multiple={true}>
            <FacetedTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t(($) => $.labels.role)}</span>
                {(roles?.length ?? 0) > 0 && (
                  <>
                    <div className="h-4 w-px bg-border mx-1" />
                    <FacetedBadgeList
                      options={roleOptions}
                      max={1}
                      placeholder=""
                      className="gap-1 p-0"
                      badgeClassName="h-5 px-1.5"
                    />
                  </>
                )}
              </Button>
            </FacetedTrigger>
            <FacetedContent className="w-48">
              <FacetedList>
                <FacetedGroup>
                  {roleOptions.map((option) => (
                    <FacetedItem key={option.value} value={option.value}>
                      {option.label}
                    </FacetedItem>
                  ))}
                </FacetedGroup>
              </FacetedList>
            </FacetedContent>
          </Faceted>
        </div>
        <div className={"flex flex-row gap-2 w-full sm:max-w-sm"}>
          <DataTableFilter
            table={table}
            searchPlaceholder={t(($) => $.user.management.table.search)}
            className="w-full"
            searchOnEnter={true}
          />
        </div>
      </div>
      <DataTable
        table={table}
        paginationData={paginationData}
        totalRowCount={paginationData?.total || 0}
        showSideBorders={false}
        showZebraStriping={true}
        defaultNoResultText={t(($) => $.user.management.table.noData)}
      />
    </div>
  );
}
