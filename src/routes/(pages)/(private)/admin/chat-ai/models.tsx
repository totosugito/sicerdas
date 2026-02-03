import { createFileRoute } from '@tanstack/react-router'
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { PageTitle } from "@/components/app";
import { SkeTable } from "@/components/custom/skeleton";
import { DialogModal, DialogModalForm, ModalFormProps, ModalProps } from "@/components/custom/components";
import * as React from "react";
import { DataTableModel, FormModelAdd, FormModelEdit } from '@/components/pages/admin/chat-ai';
import { useQueryClient } from '@tanstack/react-query';
import {
    useListModels,
    useCreateModel,
    useUpdateModel,
    useDeleteModel,
    AiModel
} from "@/api/chat-ai";
import { useState } from "react";
import { z } from "zod"
import { LuPlus } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute('/(pages)/(private)/admin/chat-ai/models')({
    validateSearch: (search: Record<string, unknown>): {
        sort?: string;
        order?: 'asc' | 'desc';
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    } => {
        return {
            sort: search.sort as string | undefined,
            order: search.order as 'asc' | 'desc' | undefined,
            page: search.page ? Number(search.page) : undefined,
            limit: search.limit ? Number(search.limit) : undefined,
            search: search.search as string | undefined,
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation()
    const queryClient = useQueryClient();
    const { sort, order, page, limit, search } = Route.useSearch();
    const navigate = Route.useNavigate();

    // Set default pagination values
    const currentPagination = {
        page: page || 1,
        limit: limit || 10,
        total: 0,
        totalPages: 0
    };

    const dataListQuery = useListModels({
        sortBy: sort,
        sortOrder: order,
        page: currentPagination.page,
        limit: currentPagination.limit,
        search
    });

    const createMutation = useCreateModel();
    const updateMutation = useUpdateModel();
    const deleteMutation = useDeleteModel();

    const [confirmationCreate, setConfirmationCreate] = useState<ModalFormProps | null>(null);
    const [confirmationPut, setConfirmationPut] = useState<ModalFormProps | null>(null);
    const [confirmationDelete, setConfirmationDelete] = useState<ModalProps | null>(null);

    const isLoading = () => {
        return (deleteMutation.isPending || createMutation.isPending || updateMutation.isPending || dataListQuery.isPending);
    }

    // Handle pagination changes
    const handlePaginationChange = (paginationData: { page: number; limit: number; total?: number; totalPages?: number }) => {
        navigate({
            search: (prev) => ({
                ...prev,
                page: paginationData.page,
                limit: paginationData.limit,
            }),
        });
    };

    const schema = z.object({
        name: z.string().min(1, "Name is required"),
        provider: z.string().min(1, "Provider is required"),
        modelIdentifier: z.string().min(1, "Identifier is required"),
        description: z.string().optional(),
        status: z.string().min(1),
        isEnabled: z.boolean().default(true),
        isDefault: z.boolean().default(false),
    });

    const defaultValues = {
        name: "",
        provider: "",
        modelIdentifier: "",
        description: "",
        status: "free",
        isEnabled: true,
        isDefault: false,
    };

    const formConfig = {
        form: {
            // Just placeholders for internal mapping, standard fields handled in component
        },
        schema: schema,
        defaultValue: defaultValues
    };

    const onDeleteData = (item: AiModel) => {
        setConfirmationDelete({
            title: "Delete Model",
            desc: "Permanently remove this AI Model. This action cannot be undone.",
            content: <div>Are you sure you want to delete <span className={"font-bold text-primary"}>{item.name}</span> ?</div>,
            textConfirm: "Delete",
            textCancel: "Cancel",
            onConfirmClick: () => {
                deleteMutation.mutate(item.id,
                    {
                        onSuccess: async () => {
                            await queryClient.invalidateQueries({ queryKey: ['admin-chat-ai-models'] });
                            showNotifSuccess({ message: "Model deleted successfully" });
                            setConfirmationDelete(null);
                        },
                        onError: (error: any) => showNotifError({ message: (error?.response?.data?.message) ?? error?.message }),
                    }
                );
            },
            onCancelClick: () => setConfirmationDelete(null),
        })
    }

    const onDataCreated = () => {
        setConfirmationCreate({
            title: "Add New Model",
            desc: "Configure a new AI model.",
            defaultValue: formConfig.defaultValue,
            child: {}, // Not used directly by custom component
            schema: formConfig.schema,
            content: <FormModelAdd />,
            onCancelClick: () => setConfirmationCreate(null),
            onConfirmClick: (body: any) => {
                createMutation.mutate(body, {
                    onSuccess: async () => {
                        await queryClient.invalidateQueries({ queryKey: ['admin-chat-ai-models'] });
                        showNotifSuccess({ message: "Model created successfully" });
                        setConfirmationCreate(null);
                    },
                    onError: (error: any) => {
                        showNotifError({ message: (error?.response?.data?.message) ?? error?.message })
                    },
                });
            },
        });
    };

    const onDataPut = (item: AiModel) => {
        const defaultVal = {
            ...item,
            description: item.description || "",
        };

        setConfirmationPut({
            title: "Update Model",
            desc: "Modify AI model configuration.",
            defaultValue: defaultVal,
            child: {},
            schema: schema,
            content: <FormModelEdit />,
            textConfirm: "Update",
            onCancelClick: () => setConfirmationPut(null),
            onConfirmClick: (body: any) => {
                updateMutation.mutate({ id: item.id, ...body }, {
                    onSuccess: async () => {
                        await queryClient.invalidateQueries({ queryKey: ['admin-chat-ai-models'] });
                        showNotifSuccess({ message: "Model updated successfully" });
                        setConfirmationPut(null);
                    },
                    onError: (error: any) => {
                        showNotifError({ message: (error?.response?.data?.message) ?? error?.message })
                    },
                });
            },
        });
    };

    const Toolbar = () => {
        return (
            <div>
                <Button variant={"outline"} onClick={onDataCreated} disabled={isLoading()}>
                    {isLoading() ? <span className={"animate-spin rounded-full h-3 w-3 border-b-2 border-current"} /> :
                        <LuPlus />} Add Model
                </Button>
            </div>
        )
    }

    return (
        <div className={"divContent"}>
            <PageTitle title={<div>AI Models</div>} showSeparator={false} />

            {(dataListQuery.isPending) && <div className={"h-full w-full flex"}>
                <SkeTable />
            </div>}

            {dataListQuery.isError &&
                <div className={"text-lg text-destructive"}>Error: {dataListQuery?.error?.message}</div>}

            {dataListQuery.isSuccess &&
                <div className={"bg-card p-2 flex flex-col gap-2"}>
                    <DataTableModel
                        data={dataListQuery?.data?.data}
                        loading={isLoading()}
                        onEditClicked={onDataPut}
                        onDeleteClicked={onDeleteData}
                        toolbarContent={<Toolbar />}
                        onPaginationChange={handlePaginationChange}
                        paginationData={{
                            ...currentPagination,
                            total: dataListQuery?.data?.data?.total || 0,
                            totalPages: dataListQuery?.data?.data?.totalPages || 0,
                            page: dataListQuery?.data?.data?.page || 1,
                            limit: dataListQuery?.data?.data?.limit || 10
                        }}
                    />
                </div>
            }

            {confirmationCreate && <DialogModalForm modal={confirmationCreate} />}
            {confirmationPut && <DialogModalForm modal={confirmationPut} />}
            {confirmationDelete && <DialogModal modal={confirmationDelete} variantSubmit={"destructive"} />}
        </div>
    )
}
