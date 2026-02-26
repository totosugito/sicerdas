import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/app';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { ControlForm } from '@/components/custom/forms';
import { useCreatePackage } from '@/api/exam/packages';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { AppRoute } from '@/constants/app-route';
import { EnumExamType } from '@/constants/exam-enums';

// Hooks for dropdowns
import { useListCategory } from '@/api/exam/categories';
import { useListTier } from '@/api/app-tier';

export const Route = createFileRoute('/(pages)/(exam)/(packages)/admin/create-package')({
  component: AdminExamPackagesCreatePage,
});

function AdminExamPackagesCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreatePackage();

  // Data for dropdowns
  const [searchCategory, setSearchCategory] = useState("");
  const { data: categoriesData, isLoading: isLoadingCategories } = useListCategory({ search: searchCategory, limit: 10, isActive: true });
  const { data: tierData, isLoading: isLoadingTier } = useListTier();

  const formSchema = z.object({
    title: z.string().min(1, t("exam.packages.list.form.title.required")),
    categoryId: z.string().min(1, t("exam.packages.list.form.category.required")),
    examType: z.string().min(1, t("exam.packages.list.form.examType.required")),
    durationMinutes: z.coerce.number().min(1, t("exam.packages.list.form.durationMinutes.min")),
    educationGradeId: z.coerce.number().optional().nullable(),
    requiredTier: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      examType: EnumExamType.OFFICIAL,
      durationMinutes: 120,
      requiredTier: "free",
      description: "",
      isActive: true,
      educationGradeId: undefined, // Let it be empty first
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      educationGradeId: values.educationGradeId || undefined,
      requiredTier: values.requiredTier || undefined,
      description: values.description || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t("exam.packages.list.notifications.createSuccess") });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-packages-list"] });
        navigate({ to: AppRoute.exam.packages.admin.list.url });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t("labels.error") });
      }
    });
  };

  const categoryOptions = categoriesData?.data.items.map(cat => ({
    label: cat.name,
    value: cat.id
  })) || [];

  const tierOptions = tierData?.data?.map((tier: any) => ({
    label: tier.name,
    value: tier.slug
  })) || [];

  const examTypeOptions = [
    { label: t("exam.packages.list.form.examType.options.official"), value: EnumExamType.OFFICIAL },
    { label: t("exam.packages.list.form.examType.options.custom_practice"), value: EnumExamType.CUSTOM_PRACTICE },
  ];

  // Dummy data for education grades. Ideally this would correspond to a real list or API if there is one.
  const educationGradeOptions = [
    { label: "SD", value: 1 },
    { label: "SMP", value: 2 },
    { label: "SMA/SMK", value: 3 },
    { label: "Mahasiswa/Persiapan", value: 4 },
  ];

  const formConfig = {
    title: {
      type: "text",
      name: "title",
      label: t("exam.packages.list.form.title.label"),
      placeholder: t("exam.packages.list.form.title.placeholder"),
    },
    categoryId: {
      type: "combobox",
      name: "categoryId",
      label: t("exam.packages.list.form.category.label"),
      placeholder: t("exam.packages.list.form.category.placeholder"),
      options: categoryOptions,
      disabled: isLoadingCategories,
      isLoading: isLoadingCategories,
      serverSideSearch: true,
      onSearchChange: (value: string) => setSearchCategory(value),
    },
    examType: {
      type: "select",
      name: "examType",
      label: t("exam.packages.list.form.examType.label"),
      placeholder: t("exam.packages.list.form.examType.placeholder"),
      options: examTypeOptions,
    },
    durationMinutes: {
      type: "number",
      name: "durationMinutes",
      label: t("exam.packages.list.form.durationMinutes.label"),
      placeholder: t("exam.packages.list.form.durationMinutes.placeholder"),
    },
    educationGradeId: {
      type: "select",
      name: "educationGradeId",
      label: t("exam.packages.list.form.educationGradeId.label"),
      placeholder: t("exam.packages.list.form.educationGradeId.placeholder"),
      options: educationGradeOptions,
    },
    requiredTier: {
      type: "select",
      name: "requiredTier",
      label: t("exam.packages.list.form.requiredTier.label"),
      placeholder: t("exam.packages.list.form.requiredTier.placeholder"),
      options: tierOptions,
      disabled: isLoadingTier,
    },
    description: {
      type: "textarea",
      name: "description",
      label: t("exam.packages.list.form.description.label"),
      placeholder: t("exam.packages.list.form.description.placeholder"),
      minRows: 3,
    },
    isActive: {
      type: "switch",
      name: "isActive",
      label: t("exam.packages.list.form.isActive.label"),
      description: t("exam.packages.list.form.isActive.description"),
    },
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate({ to: AppRoute.exam.packages.admin.list.url })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageTitle
          title={t("exam.packages.list.create.title")}
          description={<span>{t("exam.packages.list.create.description")}</span>}
        />
      </div>

      <div className="border border-border rounded-lg bg-card p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ControlForm form={form} item={formConfig.title} />
              <ControlForm form={form} item={formConfig.categoryId} />

              <ControlForm form={form} item={formConfig.examType} />
              <ControlForm form={form} item={formConfig.durationMinutes} />

              <ControlForm form={form} item={formConfig.educationGradeId} />
              <ControlForm form={form} item={formConfig.requiredTier} />
            </div>

            <ControlForm form={form} item={formConfig.description} />
            <ControlForm form={form} item={formConfig.isActive} />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: AppRoute.exam.packages.admin.list.url })}
              >
                {t("labels.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t("labels.saving") : t("labels.save")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
