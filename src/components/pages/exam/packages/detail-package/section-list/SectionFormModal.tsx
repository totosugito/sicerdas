import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCreatePackageSection, useUpdatePackageSection, ExamPackageSection } from "@/api/exam-package-sections";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { Loader2 } from "lucide-react";

interface SectionFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    section?: ExamPackageSection | null;
    packageId: string;
}

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    durationMinutes: z.number().nullable().optional(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export const SectionFormModal = ({ open, onOpenChange, mode, section, packageId }: SectionFormModalProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const createMutation = useCreatePackageSection();
    const updateMutation = useUpdatePackageSection();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            durationMinutes: null,
            isActive: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && section) {
                reset({
                    title: section.title,
                    durationMinutes: section.durationMinutes,
                    isActive: section.isActive,
                });
            } else {
                reset({
                    title: "",
                    durationMinutes: null,
                    isActive: true,
                });
            }
        }
    }, [open, mode, section, reset]);

    const onSubmit = (values: FormValues) => {
        if (mode === 'create') {
            createMutation.mutate({
                packageId,
                title: values.title,
                durationMinutes: values.durationMinutes ?? undefined,
                isActive: values.isActive,
            }, {
                onSuccess: () => {
                    showNotifSuccess({ message: t('exam.packages.detail.sections.createSuccess', 'Section created successfully') });
                    queryClient.invalidateQueries({ queryKey: ['exam-package-sections-list'] });
                    onOpenChange(false);
                },
                onError: (error: any) => {
                    showNotifError({ message: error.message || t('exam.packages.detail.sections.createError', 'Failed to create section') });
                }
            });
        } else if (mode === 'edit' && section) {
            updateMutation.mutate({
                id: section.id,
                title: values.title,
                durationMinutes: values.durationMinutes ?? undefined,
                isActive: values.isActive,
            }, {
                onSuccess: () => {
                    showNotifSuccess({ message: t('exam.packages.detail.sections.updateSuccess', 'Section updated successfully') });
                    queryClient.invalidateQueries({ queryKey: ['exam-package-sections-list'] });
                    onOpenChange(false);
                },
                onError: (error: any) => {
                    showNotifError({ message: error.message || t('exam.packages.detail.sections.updateError', 'Failed to update section') });
                }
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>
                        {mode === 'create'
                            ? t('exam.packages.detail.sections.createTitle', 'Create Section')
                            : t('exam.packages.detail.sections.editTitle', 'Edit Section')}
                    </SheetTitle>
                    <SheetDescription>
                        {mode === 'create'
                            ? t('exam.packages.detail.sections.createDesc', 'Add a new section to this exam package.')
                            : t('exam.packages.detail.sections.editDesc', 'Update the details of this section.')}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('exam.packages.detail.sections.formTitle', 'Title')}</Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder={t('exam.packages.detail.sections.formTitlePlaceholder', 'Enter section title')}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="durationMinutes">{t('exam.packages.detail.sections.formDuration', 'Duration (Minutes)')}</Label>
                        <Input
                            id="durationMinutes"
                            type="number"
                            {...register('durationMinutes', { valueAsNumber: true, setValueAs: v => (v === "" || isNaN(v) ? null : parseInt(v, 10)) })}
                            placeholder={t('exam.packages.detail.sections.formDurationPlaceholder', 'Optional')}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('exam.packages.detail.sections.formDurationHelp', 'Leave empty if there is no time limit.')}
                        </p>
                        {errors.durationMinutes && <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('exam.packages.detail.sections.formActive', 'Active')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('exam.packages.detail.sections.formActiveHelp', 'Show this section to students.')}
                            </p>
                        </div>
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button type="submit" disabled={isPending || isSubmitting}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create'
                                ? t('common.create', 'Create')
                                : t('common.save', 'Save Changes')}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};
