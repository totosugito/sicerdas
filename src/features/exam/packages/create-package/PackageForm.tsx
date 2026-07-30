import React, { useEffect, useState, useMemo } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { EnumExamType } from "@/api/exam/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadCloud, Trash2, Zap, Info } from "lucide-react";

// Hooks for dropdowns
import { useListCategorySimple } from "@/api/education/categories";
import { useListTier } from "@/api/tier";
import { useListGradeSimple } from "@/api/education/grades";
import { useListVersionSimple } from "@/api/version/list-version-simple";
import { EnumContentType } from "@/api/types";
import { PackageFormValues } from "@/api/exam/packages";
import { PackageCardPreview } from "./PackageCardPreview";
import { PackageHeroPreview } from "./PackageHeroPreview";

type PackageFormProps = {
  defaultValues?: Partial<PackageFormValues>;
  onSubmit: (values: PackageFormValues) => void;
  isPending?: boolean;
};

export function PackageForm({ defaultValues, onSubmit, isPending }: PackageFormProps) {
  const { t } = useAppTranslation();
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Data for dropdowns
  const { data: categoriesData, isFetching: isFetchingCategories } = useListCategorySimple({
    limit: 1000,
  });
  const { data: gradesData, isFetching: isFetchingGrades } = useListGradeSimple({ limit: 1000 });
  const { data: tierData, isLoading: isLoadingTier } = useListTier();
  const { data: versionData, isFetching: isFetchingVersions } = useListVersionSimple({
    dataType: EnumContentType.EXAM,
    limit: 1000,
  });

  const categoryOptions = categoriesData?.data?.items || [];
  const educationGradeOptions = gradesData?.data?.items || [];

  const formSchema = z.object({
    title: z.string().min(
      1,
      t(($) => $.exam.packages.form.title.required),
    ),
    categoryId: z.string().min(
      1,
      t(($) => $.exam.packages.form.category.required),
    ),
    examType: z.string().min(
      1,
      t(($) => $.exam.packages.form.examType.required),
    ),
    educationGradeId: z.coerce.number().optional().nullable(),
    requiredTier: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
    versionId: z.coerce.number().min(
      1,
      t(($) => $.exam.packages.form.versionId.required),
    ),
    thumbnail: z.string().optional().nullable(),
    newThumbnailFile: z.any().optional().nullable(),
  });

  const form = useAppForm({
    defaultValues: {
      title: "",
      categoryId: "",
      examType: EnumExamType.OFFICIAL,
      durationMinutes: "",
      requiredTier: "free",
      description: "",
      isActive: true,
      educationGradeId: "",
      versionId: "",
      thumbnail: null,
      ...defaultValues,
    } as PackageFormValues,
    validators: {
      onChange: formSchema as any,
    },
  });

  // Reset the form whenever defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        title: "",
        categoryId: "",
        examType: EnumExamType.OFFICIAL,
        durationMinutes: "",
        requiredTier: "free",
        description: "",
        isActive: true,
        educationGradeId: "",
        versionId: "",
        thumbnail: null,
        ...defaultValues,
      });
    }
  }, [JSON.stringify(defaultValues), form]);

  const tierOptions =
    tierData?.data?.map((tier: any) => ({ label: tier.name, value: tier.slug })) || [];
  const examTypeOptions = [
    {
      label: t(($) => $.exam.packages.form.examType.options.official),
      value: EnumExamType.OFFICIAL,
    },
    {
      label: t(($) => $.exam.packages.form.examType.options.custom_practice),
      value: EnumExamType.CUSTOM_PRACTICE,
    },
    {
      label: t(($) => $.exam.packages.form.examType.options.course_exam),
      value: EnumExamType.COURSE_EXAM,
    },
  ];
  const versionOptions =
    versionData?.data?.items?.map((v) => ({
      label: `${v.id} - ${v.name}${v.published ? ` [${t(($) => $.labels.publishedText)}]` : ""}`,
      value: v.id.toString(),
    })) || [];



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setFieldValue("newThumbnailFile", file);
      const reader = new FileReader();
      reader.onloadend = () => setLocalPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    form.setFieldValue("newThumbnailFile", null);
    form.setFieldValue("thumbnail", null);
    setLocalPreview(null);
  };

  const formConfig = {
    title: {
      type: "text",
      name: "title",
      label: t(($) => $.exam.packages.form.title.label),
      placeholder: t(($) => $.exam.packages.form.title.placeholder),
      required: true,
    },
    categoryId: {
      type: "combobox",
      name: "categoryId",
      label: t(($) => $.exam.packages.form.category.label),
      placeholder: t(($) => $.exam.packages.form.category.placeholder),
      options: categoryOptions,
      disabled: isFetchingCategories,
      isLoading: isFetchingCategories,
      required: true,
    },
    examType: {
      type: "select",
      name: "examType",
      label: t(($) => $.exam.packages.form.examType.label),
      placeholder: t(($) => $.exam.packages.form.examType.placeholder),
      options: examTypeOptions,
    },
    educationGradeId: {
      type: "combobox",
      name: "educationGradeId",
      label: t(($) => $.exam.packages.form.educationGradeId.label),
      placeholder: t(($) => $.exam.packages.form.educationGradeId.placeholder),
      options: educationGradeOptions,
      disabled: isFetchingGrades,
      isLoading: isFetchingGrades,
    },
    requiredTier: {
      type: "select",
      name: "requiredTier",
      label: t(($) => $.exam.packages.form.requiredTier.label),
      placeholder: t(($) => $.exam.packages.form.requiredTier.placeholder),
      options: tierOptions,
      disabled: isLoadingTier,
    },
    versionId: {
      type: "combobox",
      name: "versionId",
      label: t(($) => $.exam.packages.form.versionId.label),
      placeholder: t(($) => $.exam.packages.form.versionId.placeholder),
      options: versionOptions,
      disabled: isFetchingVersions,
      isLoading: isFetchingVersions,
      required: true,
    },
    description: {
      type: "textarea",
      name: "description",
      label: t(($) => $.exam.packages.form.description.label),
      placeholder: t(($) => $.exam.packages.form.description.placeholder),
      minRows: 2,
    },
    isActive: {
      type: "switch",
      name: "isActive",
      label: t(($) => $.exam.packages.form.isActive.label),
      description: t(($) => $.exam.packages.form.isActive.description),
    },
  };

  return (
    <form.AppForm>
      <FormWithDetector
        form={form}
        onSubmit={(values) => onSubmit(values as PackageFormValues)}
        className="w-full"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Form Controls */}
          <div className="w-full lg:w-[450px] space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {t(($) => $.exam.packages.form.infoTitle)}
              </h3>

              <div className="space-y-4">
                <form.AppField name="title">
                  {(field: any) => <ControlForm field={field} item={formConfig.title} showMessage={false} />}
                </form.AppField>

                {/* Thumbnail Upload section */}
                <form.Subscribe selector={(state: any) => state.values.thumbnail}>
                  {(thumbnail: any) => (
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">
                        {t(($) => $.exam.packages.form.thumbnail.label)}
                      </Label>
                      <div
                        className={cn(
                          "relative group h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                          localPreview || thumbnail
                            ? "border-primary/50"
                            : "border-border hover:border-primary/50 bg-secondary/30",
                        )}
                      >
                        {localPreview || thumbnail ? (
                          <>
                            <img
                              src={localPreview || thumbnail!}
                              className="w-full h-full object-cover"
                              alt="Selected thumbnail"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  (document.getElementById("thumb-input") as HTMLInputElement).click()
                                }
                              >
                                {t(($) => $.exam.packages.form.thumbnail.change)}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={removeImage}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              (document.getElementById("thumb-input") as HTMLInputElement).click()
                            }
                            className="flex flex-col items-center gap-2 w-full h-full justify-center"
                          >
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <p className="text-[11px] font-medium px-4 text-center text-muted-foreground">
                              {t(($) => $.exam.packages.form.thumbnail.dropzone)}
                            </p>
                          </button>
                        )}
                        <input
                          id="thumb-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight italic">
                        {t(($) => $.exam.packages.form.thumbnail.description)}
                      </p>
                    </div>
                  )}
                </form.Subscribe>

                <div className="space-y-4">
                  <form.AppField name="categoryId">
                    {(field: any) => <ControlForm field={field} item={formConfig.categoryId} showMessage={false} />}
                  </form.AppField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <form.AppField name="examType">
                    {(field: any) => <ControlForm field={field} item={formConfig.examType} showMessage={false} />}
                  </form.AppField>
                  <form.AppField name="educationGradeId">
                    {(field: any) => <ControlForm field={field} item={formConfig.educationGradeId} showMessage={false} />}
                  </form.AppField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <form.AppField name="requiredTier">
                    {(field: any) => <ControlForm field={field} item={formConfig.requiredTier} showMessage={false} />}
                  </form.AppField>
                  <form.AppField name="versionId">
                    {(field: any) => <ControlForm field={field} item={formConfig.versionId} showMessage={false} />}
                  </form.AppField>
                </div>

                <form.AppField name="description">
                  {(field: any) => <ControlForm field={field} item={formConfig.description} showMessage={false} />}
                </form.AppField>

                <div className="pt-2 px-1">
                  <form.AppField name="isActive">
                    {(field: any) => <ControlForm field={field} item={formConfig.isActive} showMessage={false} />}
                  </form.AppField>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => form.reset()}
                >
                  {t(($) => $.labels.cancel)}
                </Button>
                <Button type="submit" className="rounded-full px-8 font-bold" disabled={isPending}>
                  {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Live Preview Sticky */}
          <form.Subscribe selector={(state: any) => state.values}>
            {(watchedValues: any) => {
              const selectedCategoryName = categoryOptions.find(
                (c) => c.value === watchedValues.categoryId,
              )?.label;
              const selectedGradeName = educationGradeOptions.find(
                (g) => String(g.value) === String(watchedValues.educationGradeId),
              )?.label;

              return (
                <div className="flex-1 w-full lg:sticky lg:top-24 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <h3 className="font-extrabold text-xl tracking-tight text-foreground/90">
                        {t(($) => $.exam.packages.form.preview.title)}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {t(($) => $.exam.packages.form.preview.description)}
                      </p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg animate-pulse">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <Tabs defaultValue="card" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full max-w-sm bg-muted/50 p-1 mb-6 rounded-xl border border-border/40">
                      <TabsTrigger
                        value="card"
                        className="rounded-lg font-bold text-xs uppercase tracking-wide"
                      >
                        {t(($) => $.exam.packages.form.preview.card)}
                      </TabsTrigger>
                      <TabsTrigger
                        value="hero"
                        className="rounded-lg font-bold text-xs uppercase tracking-wide"
                      >
                        {t(($) => $.exam.packages.form.preview.hero)}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="card"
                      className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                    >
                      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border border-border/20 flex items-center justify-center min-h-[400px]">
                        <PackageCardPreview
                          values={watchedValues}
                          categoryName={selectedCategoryName}
                          gradeName={selectedGradeName}
                          previewUrl={localPreview || undefined}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="hero"
                      className="mt-0 focus-visible:outline-none focus-visible:ring-0"
                    >
                      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border border-border/20 min-h-[400px]">
                        <PackageHeroPreview
                          values={watchedValues}
                          categoryName={selectedCategoryName}
                          gradeName={selectedGradeName}
                          previewUrl={localPreview || undefined}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                        <strong>{t(($) => $.labels.tip)}:</strong>{" "}
                        {t(($) => $.exam.packages.form.preview.tip)}
                      </p>
                    </div>
                  </Card>
                </div>
              );
            }}
          </form.Subscribe>
        </div>
      </FormWithDetector>
    </form.AppForm>
  );
}
