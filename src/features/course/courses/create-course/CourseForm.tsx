import React, { useEffect, useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadCloud, Trash2, Info, BookOpen } from "lucide-react";
import { useListCategorySimple } from "@/api/education/categories";
import { useListGradeSimple } from "@/api/education/grades";
import { EnumContentStatus } from "@/api/types";
import { CourseFormValues } from "@/api/course/courses";
import { CourseStatusBadge } from "../components/CourseStatusBadge";

type CourseFormProps = {
  defaultValues?: Partial<CourseFormValues>;
  onSubmit: (values: CourseFormValues) => void;
  isPending?: boolean;
};

export function CourseForm({ defaultValues, onSubmit, isPending }: CourseFormProps) {
  const { t } = useAppTranslation();
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const { data: categoriesData, isLoading: isLoadingCategories } = useListCategorySimple({ limit: 1000 });
  const { data: gradesData, isLoading: isLoadingGrades } = useListGradeSimple({ limit: 1000 });

  const categoryOptions = (categoriesData?.data?.items || []).map((cat) => ({
    label: cat.label,
    value: cat.value,
  }));

  const gradeOptions = (gradesData?.data?.items || []).map((grade) => ({
    label: grade.label,
    value: grade.value,
  }));

  const statusOptions = Object.entries(EnumContentStatus).map(([_, val]) => ({
    label: val.charAt(0).toUpperCase() + val.slice(1),
    value: val,
  }));

  const formSchema = z.object({
    courseCode: z.string().min(2, t(($) => $.course.courses.form.courseCode.required)),
    courseName: z.string().min(2, t(($) => $.course.courses.form.courseName.required)),
    categoryId: z.string().min(1, t(($) => $.course.courses.form.categoryId.required)),
    educationGradeId: z.coerce.number().min(1, t(($) => $.course.courses.form.educationGradeId.required)),
    courseDescription: z.string().optional(),
    whatYouWillLearn: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    instructions: z.string().optional(),
    status: z.string().default("draft"),
    isPublic: z.boolean().default(false),
    isSequential: z.boolean().default(true),
    thumbnail: z.string().optional().nullable(),
    newThumbnailFile: z.any().optional().nullable(),
  });

  const form = useAppForm({
    defaultValues: {
      courseCode: "",
      courseName: "",
      categoryId: "",
      educationGradeId: "",
      courseDescription: "",
      whatYouWillLearn: "",
      price: 0,
      instructions: "",
      status: "draft",
      isPublic: false,
      isSequential: true,
      thumbnail: null,
      ...defaultValues,
    } as CourseFormValues,
    validators: {
      onChange: formSchema as any,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        courseCode: "",
        courseName: "",
        categoryId: "",
        educationGradeId: "",
        courseDescription: "",
        whatYouWillLearn: "",
        price: 0,
        instructions: "",
        status: "draft",
        isPublic: false,
        isSequential: true,
        thumbnail: null,
        ...defaultValues,
      });
    }
  }, [JSON.stringify(defaultValues), form]);

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
    courseCode: {
      type: "text",
      name: "courseCode",
      label: t(($) => $.course.courses.form.courseCode.label),
      placeholder: t(($) => $.course.courses.form.courseCode.placeholder),
      required: true,
    },
    courseName: {
      type: "text",
      name: "courseName",
      label: t(($) => $.course.courses.form.courseName.label),
      placeholder: t(($) => $.course.courses.form.courseName.placeholder),
      required: true,
    },
    categoryId: {
      type: "combobox",
      name: "categoryId",
      label: t(($) => $.course.courses.form.categoryId.label),
      placeholder: t(($) => $.course.courses.form.categoryId.placeholder),
      options: categoryOptions,
      isLoading: isLoadingCategories,
      required: true,
    },
    educationGradeId: {
      type: "combobox",
      name: "educationGradeId",
      label: t(($) => $.course.courses.form.educationGradeId.label),
      placeholder: t(($) => $.course.courses.form.educationGradeId.placeholder),
      options: gradeOptions,
      isLoading: isLoadingGrades,
      required: true,
    },
    price: {
      type: "number",
      name: "price",
      label: t(($) => $.course.courses.form.price.label),
      placeholder: t(($) => $.course.courses.form.price.placeholder),
    },
    status: {
      type: "select",
      name: "status",
      label: t(($) => $.course.courses.form.status.label),
      placeholder: t(($) => $.course.courses.form.status.placeholder),
      options: statusOptions,
    },
    courseDescription: {
      type: "textarea",
      name: "courseDescription",
      label: t(($) => $.course.courses.form.courseDescription.label),
      placeholder: t(($) => $.course.courses.form.courseDescription.placeholder),
      minRows: 3,
    },
    whatYouWillLearn: {
      type: "textarea",
      name: "whatYouWillLearn",
      label: t(($) => $.course.courses.form.whatYouWillLearn.label),
      placeholder: t(($) => $.course.courses.form.whatYouWillLearn.placeholder),
      minRows: 3,
    },
    isPublic: {
      type: "switch",
      name: "isPublic",
      label: t(($) => $.course.courses.form.isPublic.label),
      description: t(($) => $.course.courses.form.isPublic.description),
    },
    isSequential: {
      type: "switch",
      name: "isSequential",
      label: t(($) => $.course.courses.form.isSequential.label),
      description: t(($) => $.course.courses.form.isSequential.description),
    },
  };

  return (
    <form.AppForm>
      <FormWithDetector
        form={form}
        onSubmit={(values) => onSubmit(values as CourseFormValues)}
        className="w-full"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="w-full lg:w-[450px] space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {t(($) => $.course.courses.form.infoTitle)}
              </h3>

              <div className="space-y-4">
                <form.AppField name="courseCode">
                  {(field: any) => <ControlForm field={field} item={formConfig.courseCode} showMessage={false} />}
                </form.AppField>

                <form.AppField name="courseName">
                  {(field: any) => <ControlForm field={field} item={formConfig.courseName} showMessage={false} />}
                </form.AppField>

                {/* Thumbnail Upload section */}
                <form.Subscribe selector={(state: any) => state.values.thumbnail}>
                  {(thumbnail: any) => (
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">
                        {t(($) => $.course.courses.form.thumbnail.label)}
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
                              src={localPreview || thumbnail}
                              alt="Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="cursor-pointer bg-white text-black hover:bg-white/90 font-medium text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                                <UploadCloud className="h-4 w-4" />
                                {t(($) => $.course.courses.form.thumbnail.change)}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeImage}
                                className="h-8 text-xs gap-1.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {t(($) => $.course.courses.form.thumbnail.remove)}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center p-4 text-center w-full h-full">
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold text-foreground">
                              {t(($) => $.course.courses.form.thumbnail.upload)}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </form.Subscribe>

                <form.AppField name="categoryId">
                  {(field: any) => <ControlForm field={field} item={formConfig.categoryId} showMessage={false} />}
                </form.AppField>

                <form.AppField name="educationGradeId">
                  {(field: any) => <ControlForm field={field} item={formConfig.educationGradeId} showMessage={false} />}
                </form.AppField>

                <form.AppField name="price">
                  {(field: any) => <ControlForm field={field} item={formConfig.price} showMessage={false} />}
                </form.AppField>

                <form.AppField name="status">
                  {(field: any) => <ControlForm field={field} item={formConfig.status} showMessage={false} />}
                </form.AppField>

                <form.AppField name="courseDescription">
                  {(field: any) => <ControlForm field={field} item={formConfig.courseDescription} showMessage={false} />}
                </form.AppField>

                <form.AppField name="whatYouWillLearn">
                  {(field: any) => <ControlForm field={field} item={formConfig.whatYouWillLearn} showMessage={false} />}
                </form.AppField>

                <form.AppField name="isPublic">
                  {(field: any) => <ControlForm field={field} item={formConfig.isPublic} showMessage={false} />}
                </form.AppField>

                <form.AppField name="isSequential">
                  {(field: any) => <ControlForm field={field} item={formConfig.isSequential} showMessage={false} />}
                </form.AppField>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button type="submit" disabled={isPending}>
                  {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Authoring Preview */}
          <div className="flex-1 w-full space-y-6">
            <Card className="p-6 rounded-2xl border shadow-sm space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {t(($) => $.course.courses.form.livePreview)}
              </h3>
              <form.Subscribe selector={(state: any) => state.values}>
                {(values: CourseFormValues) => (
                  <div className="border rounded-2xl p-5 space-y-4 bg-muted/20">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                      {localPreview || values.thumbnail ? (
                        <img
                          src={localPreview || values.thumbnail!}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t(($) => $.course.courses.form.preview.thumbnailPlaceholder)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {values.courseCode || t(($) => $.course.courses.form.preview.defaultCode)}
                      </span>
                      <h4 className="font-bold text-xl text-foreground">
                        {values.courseName || t(($) => $.course.courses.form.preview.defaultName)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {values.courseDescription || t(($) => $.course.courses.form.preview.defaultDescription)}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-sm font-semibold">
                        <span>
                          {Number(values.price) === 0
                            ? t(($) => $.course.courses.form.preview.freeText)
                            : `Rp ${Number(values.price || 0).toLocaleString("id-ID")}`}
                        </span>
                        <CourseStatusBadge status={values.status ?? EnumContentStatus.DRAFT} />
                      </div>
                    </div>
                  </div>
                )}
              </form.Subscribe>
            </Card>
          </div>
        </div>
      </FormWithDetector>
    </form.AppForm>
  );
}
