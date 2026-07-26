import React from "react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ChevronDown, Package2 } from "lucide-react";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useListPackageSimple } from "@/api/exam/packages";
import { useListPackageSectionSimple } from "@/api/exam/package-sections";

interface PackageParamsFormProps {
  form: any;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PackageParamsForm({ form, isOpen = true, onOpenChange }: PackageParamsFormProps) {
  const { t } = useAppTranslation();

  // Watch package selection to filter sections reactively
  const packageId = form.useStore((state: any) => state.values.packageId);
  const prevPackageIdRef = React.useRef(packageId);

  React.useEffect(() => {
    if (prevPackageIdRef.current !== packageId) {
      form.setFieldValue("sectionId", "");
      prevPackageIdRef.current = packageId;
    }
  }, [packageId, form]);

  const { data: packagesData, isFetching: isFetchingPackages } = useListPackageSimple({
    limit: 1000,
  });

  const { data: sectionsData, isFetching: isFetchingSections } = useListPackageSectionSimple({
    packageId: packageId || undefined,
    limit: 1000,
  });

  const packageOptions = packagesData?.data?.items || [];
  const sectionOptions = sectionsData?.data?.items || [];

  const config = {
    packageId: {
      type: "combobox" as const,
      name: "packageId",
      label: t(($) => $.exam.questions.form.package.label),
      placeholder: t(($) => $.exam.questions.form.package.placeholder),
      options: packageOptions,
      disabled: isFetchingPackages,
      isLoading: isFetchingPackages,
    },
    sectionId: {
      type: "combobox" as const,
      name: "sectionId",
      label: t(($) => $.exam.questions.form.section.label),
      placeholder: t(($) => $.exam.questions.form.section.placeholder),
      options: sectionOptions,
      disabled: !packageId || isFetchingSections,
      isLoading: isFetchingSections,
    },
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger
          render={
            <button
              type="button"
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b w-full text-left outline-none"
            >
              <div className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  {t(($) => $.exam.questions.jsonQuestions.packageParameters.title)}
                </h3>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
            </button>
          }
        />
        <CollapsibleContent className="p-6">
          <form.AppForm>
            <FormWithDetector
              form={form}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form.AppField name="packageId">
                  {(field: any) => <ControlForm field={field} item={config.packageId} showMessage={true} />}
                </form.AppField>
                <form.AppField name="sectionId">
                  {(field: any) => <ControlForm field={field} item={config.sectionId} showMessage={true} />}
                </form.AppField>
              </div>
            </FormWithDetector>
          </form.AppForm>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
            <p>{t(($) => $.exam.questions.jsonQuestions.packageParameters.overrideNote)}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
