import React, { useEffect } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { FormWithDetector } from "@/components/custom/components";

type QuestionContentFormProps = {
  defaultValues: any;
  onSubmit: (values: { content?: any[]; reasonContent?: any[] }) => void;
  isPending?: boolean;
};

const formSchema = z.object({
  content: z.array(z.record(z.string(), z.unknown())).min(1),
  reasonContent: z.array(z.record(z.string(), z.unknown())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionContentForm({
  defaultValues,
  onSubmit,
  isPending,
}: QuestionContentFormProps) {
  const { t } = useAppTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: defaultValues.content || [],
      reasonContent: defaultValues.reasonContent || [],
    },
  });

  useEffect(() => {
    form.reset({
      content: defaultValues.content || [],
      reasonContent: defaultValues.reasonContent || [],
    });
  }, [defaultValues.content, defaultValues.reasonContent, form]);

  const onFormSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const type = defaultValues.type;
  const isReasoning = type === "statement_reasoning";

  const formConfig = {
    content: {
      type: "blocknote",
      name: "content",
      label: t(($) => $.exam.questions.form.content.label),
      placeholder: t(($) => $.exam.questions.form.content.placeholder),
      minHeight: isReasoning ? "200px" : "300px",
    },
    reasonContent: {
      type: "blocknote",
      name: "reasonContent",
      label: t(($) => $.exam.questions.form.reasonContent.label),
      placeholder: t(($) => $.exam.questions.form.reasonContent.placeholder),
      minHeight: isReasoning ? "200px" : "300px",
    },
  };

  return (
    <Form {...form}>
      <FormWithDetector
        form={form}
        onSubmit={onFormSubmit}
        schema={formSchema}
        className="space-y-6"
      >
        <ControlForm form={form} item={formConfig.content} />

        {isReasoning && (
          <div className="pt-6 border-t border-dashed">
            <ControlForm form={form} item={formConfig.reasonContent} />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPending}>
            {t(($) => $.labels.cancel)}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t(($) => $.labels.saving) : t(($) => $.labels.save)}
          </Button>
        </div>
      </FormWithDetector>
    </Form>
  );
}
