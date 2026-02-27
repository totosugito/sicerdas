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
import { useListEducationGrade } from '@/api/education-grade';

export const Route = createFileRoute('/(pages)/(exam)/(packages)/admin/create-package')({
  component: AdminExamPackagesCreatePage,
});

function AdminExamPackagesCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreatePackage();

  // Data for dropdowns
  const [searchCategory, setSearchCategory] = React.useState("");
  const [pageCategory, setPageCategory] = React.useState(1);
  const { data: categoriesData, isFetching: isFetchingCategories } = useListCategory({ search: searchCategory, limit: 10, isActive: true, page: pageCategory });
  const [categoryOptions, setCategoryOptions] = React.useState<{ label: string, value: string }[]>([]);

  const [searchGrade, setSearchGrade] = React.useState("");
  const [pageGrade, setPageGrade] = React.useState(1);
  const { data: gradesData, isFetching: isFetchingGrades } = useListEducationGrade({ search: searchGrade, limit: 10, page: pageGrade });
  const [educationGradeOptions, setEducationGradeOptions] = React.useState<{ label: string, value: string }[]>([]);

  const { data: tierData, isLoading: isLoadingTier } = useListTier();

  React.useEffect(() => {
    if (categoriesData?.data?.items) {
      const newItems = categoriesData.data.items.map(cat => ({ label: cat.name, value: cat.id }));
      if (pageCategory === 1) setCategoryOptions(newItems);
      else setCategoryOptions(prev => [...prev, ...newItems.filter(n => !prev.some(p => p.value === n.value))]);
    }
  }, [categoriesData, pageCategory]);

  React.useEffect(() => {
    if (gradesData?.data?.items) {
      const newItems = gradesData.data.items.map(grade => ({ label: grade.name, value: String(grade.id) }));
      if (pageGrade === 1) setEducationGradeOptions(newItems);
      else setEducationGradeOptions(prev => [...prev, ...newItems.filter(n => !prev.some(p => p.value === n.value))]);
    }
  }, [gradesData, pageGrade]);

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

  const tierOptions = tierData?.data?.map((tier: any) => ({
    label: tier.name,
    value: tier.slug
  })) || [];

  const examTypeOptions = [
    { label: t("exam.packages.list.form.examType.options.official"), value: EnumExamType.OFFICIAL },
    { label: t("exam.packages.list.form.examType.options.custom_practice"), value: EnumExamType.CUSTOM_PRACTICE },
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
      disabled: isFetchingCategories,
      isLoading: isFetchingCategories,
      serverSideSearch: true,
      onSearchChange: (value: string) => {
        setSearchCategory(value);
        setPageCategory(1);
      },
      onScrollEnd: () => {
        if (!isFetchingCategories && categoriesData?.data?.meta && pageCategory < categoriesData.data.meta.totalPages) {
          setPageCategory(prev => prev + 1);
        }
      }
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
      type: "combobox",
      name: "educationGradeId",
      label: t("exam.packages.list.form.educationGradeId.label"),
      placeholder: t("exam.packages.list.form.educationGradeId.placeholder"),
      options: educationGradeOptions,
      disabled: isFetchingGrades,
      isLoading: isFetchingGrades,
      serverSideSearch: true,
      onSearchChange: (value: string) => {
        setSearchGrade(value);
        setPageGrade(1);
      },
      onScrollEnd: () => {
        if (!isFetchingGrades && gradesData?.data?.meta && pageGrade < gradesData.data.meta.totalPages) {
          setPageGrade(prev => prev + 1);
        }
      }
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
        <PageTitle
          title={t("exam.packages.list.create.title")}
          description={<span>{t("exam.packages.list.create.description")}</span>}
          showBack
          backTo={AppRoute.exam.packages.admin.list.url}
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
