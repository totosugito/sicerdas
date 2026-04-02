import React from "react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ChevronDown, Package2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UseFormReturn } from "react-hook-form";
import { useListPackageSimple } from "@/api/exam-packages";
import { useListPackageSectionSimple } from "@/api/exam-package-sections";

interface PackageParamsFormProps {
  form: UseFormReturn<any>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PackageParamsForm({ form, isOpen = true, onOpenChange }: PackageParamsFormProps) {
  const { t } = useAppTranslation();

  // Watch package selection to filter sections
  const packageId = form.watch("packageId");
  const prevPackageIdRef = React.useRef(packageId);

  React.useEffect(() => {
    if (prevPackageIdRef.current !== packageId) {
      form.setValue("sectionId", "");
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
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b">
            <div className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">
                {t(($) => $.exam.questions.jsonQuestions.packageParameters.title)}
              </h3>
            </div>
            <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6">
          <Form {...form}>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ControlForm form={form} item={config.packageId} showMessage={true} />
              <ControlForm form={form} item={config.sectionId} showMessage={true} />
            </form>
          </Form>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
            <p>{t(($) => $.exam.questions.jsonQuestions.packageParameters.overrideNote)}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
