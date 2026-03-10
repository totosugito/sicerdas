import React, { useEffect } from 'react';
import { useAppTranslation } from '@/lib/i18n-typed';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ControlForm } from '@/components/custom/forms';
import { EnumExamType } from 'backend/src/db/schema/exam/enums';
import { FormWithDetector } from '@/components/custom/components';

// Hooks for dropdowns
import { useListCategorySimple } from '@/api/education-categories';
import { useListTier } from '@/api/app-tier';
import { useListGradeSimple } from '@/api/education-grade';
import { durationOnMinutes } from '@/constants/app-enum';

export type PackageFormValues = {
    title: string;
    categoryId: string;
    examType: string;
    durationMinutes: string;
    educationGradeId?: string | number | null;
    requiredTier?: string;
    description?: string;
    isActive: boolean;
};

type PackageFormProps = {
    defaultValues?: Partial<PackageFormValues>;
    onSubmit: (values: PackageFormValues) => void;
    isPending?: boolean;
};

export function PackageForm({ defaultValues, onSubmit, isPending }: PackageFormProps) {
    const { t } = useAppTranslation();

    // Data for dropdowns (Fetching all active options at once)
    const { data: categoriesData, isFetching: isFetchingCategories } = useListCategorySimple({ limit: 1000 });
    const { data: gradesData, isFetching: isFetchingGrades } = useListGradeSimple({ limit: 1000 });
    const { data: tierData, isLoading: isLoadingTier } = useListTier();

    const categoryOptions = categoriesData?.data?.items || [];
    const educationGradeOptions = gradesData?.data?.items || [];

    const formSchema = z.object({
        title: z.string().min(1, t($ => $.exam.packages.form.title.required)),
        categoryId: z.string().min(1, t($ => $.exam.packages.form.category.required)),
        examType: z.string().min(1, t($ => $.exam.packages.form.examType.required)),
        durationMinutes: z.string().optional(),
        educationGradeId: z.coerce.number().optional().nullable(),
        requiredTier: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
    });

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            categoryId: "",
            examType: EnumExamType.OFFICIAL,
            durationMinutes: "0",
            requiredTier: "free",
            description: "",
            isActive: true,
            educationGradeId: "", // Use empty string for empty state
            ...defaultValues,
        },
    });

    // Reset the form whenever defaultValues from prop change
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                title: "",
                categoryId: "",
                examType: EnumExamType.OFFICIAL,
                durationMinutes: "0",
                requiredTier: "free",
                description: "",
                isActive: true,
                educationGradeId: "",
                ...defaultValues,
            });
        }
    }, [defaultValues, form]);

    const tierOptions = tierData?.data?.map((tier: any) => ({
        label: tier.name,
        value: tier.slug
    })) || [];

    const examTypeOptions = [
        { label: t($ => $.exam.packages.form.examType.options.official), value: EnumExamType.OFFICIAL },
        { label: t($ => $.exam.packages.form.examType.options.custom_practice), value: EnumExamType.CUSTOM_PRACTICE },
    ];

    const formConfig = {
        title: {
            type: "text",
            name: "title",
            label: t($ => $.exam.packages.form.title.label),
            placeholder: t($ => $.exam.packages.form.title.placeholder),
            required: true,
        },
        categoryId: {
            type: "combobox",
            name: "categoryId",
            label: t($ => $.exam.packages.form.category.label),
            placeholder: t($ => $.exam.packages.form.category.placeholder),
            options: categoryOptions,
            disabled: isFetchingCategories,
            isLoading: isFetchingCategories,
            required: true,
        },
        examType: {
            type: "select",
            name: "examType",
            label: t($ => $.exam.packages.form.examType.label),
            placeholder: t($ => $.exam.packages.form.examType.placeholder),
            options: examTypeOptions,
        },
        durationMinutes: {
            type: "select",
            name: "durationMinutes",
            label: t($ => $.exam.packages.form.durationMinutes.label),
            placeholder: t($ => $.exam.packages.form.durationMinutes.placeholder),
            options: durationOnMinutes,
            description: t($ => $.exam.packages.form.durationMinutes.description),
        },
        educationGradeId: {
            type: "combobox",
            name: "educationGradeId",
            label: t($ => $.exam.packages.form.educationGradeId.label),
            placeholder: t($ => $.exam.packages.form.educationGradeId.placeholder),
            options: educationGradeOptions,
            disabled: isFetchingGrades,
            isLoading: isFetchingGrades,
        },
        requiredTier: {
            type: "select",
            name: "requiredTier",
            label: t($ => $.exam.packages.form.requiredTier.label),
            placeholder: t($ => $.exam.packages.form.requiredTier.placeholder),
            options: tierOptions,
            disabled: isLoadingTier,
        },
        description: {
            type: "textarea",
            name: "description",
            label: t($ => $.exam.packages.form.description.label),
            placeholder: t($ => $.exam.packages.form.description.placeholder),
            minRows: 3,
        },
        isActive: {
            type: "switch",
            name: "isActive",
            label: t($ => $.exam.packages.form.isActive.label),
            description: t($ => $.exam.packages.form.isActive.description),
        },
    };

    return (
        <Form {...form}>
            <FormWithDetector
                form={form}
                onSubmit={(values) => onSubmit(values as PackageFormValues)}
                schema={formSchema}
                className=""
            >
                <div className="border border-border rounded-lg bg-card p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ControlForm form={form} item={formConfig.title} showMessage={false} />
                        <ControlForm form={form} item={formConfig.categoryId} showMessage={false} />

                        <ControlForm form={form} item={formConfig.examType} showMessage={false} />
                        <ControlForm form={form} item={formConfig.durationMinutes} showMessage={false} />

                        <ControlForm form={form} item={formConfig.educationGradeId} showMessage={false} />
                        <ControlForm form={form} item={formConfig.requiredTier} showMessage={false} />
                    </div>

                    <ControlForm form={form} item={formConfig.description} showMessage={false} />
                    <ControlForm form={form} item={formConfig.isActive} showMessage={false} />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                        >
                            {t($ => $.labels.cancel)}
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? t($ => $.labels.saving) : t($ => $.labels.save)}
                        </Button>
                    </div>
                </div>
            </FormWithDetector>
        </Form>
    );
}
