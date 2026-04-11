import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Image as ImageIcon, Type, Layers, Library } from "lucide-react";
import { getExamPromptTemplate } from "@/data/prompt/exam-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showNotifError } from "@/lib/show-notif";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms/ControlForm";
import { FormWithDetector } from "@/components/custom/components";

export type PromptGeneratorParams = {
  curriculum: string;
  grade: string;
  subject: string;
  language: string;
  sourceMaterial: string;
};

type PromptGeneratorFormProps = {
  defaultValues: PromptGeneratorParams;
  onPersist: (values: PromptGeneratorParams) => void;
};

export function PromptGeneratorForm({ defaultValues, onPersist }: PromptGeneratorFormProps) {
  const { t } = useAppTranslation();
  const [copied, setCopied] = useState(false);

  // Define schema for the form
  const formSchema = z.object({
    curriculum: z.string().min(
      1,
      t(($) => $.labels.required),
    ),
    grade: z.string().min(
      1,
      t(($) => $.labels.required),
    ),
    subject: z.string().min(
      1,
      t(($) => $.labels.required),
    ),
    language: z.string().min(
      1,
      t(($) => $.labels.required),
    ),
    sourceMaterial: z.string().min(
      1,
      t(($) => $.labels.required),
    ),
  });

  const form = useForm<PromptGeneratorParams>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchedValues = useWatch({ control: form.control });
  const promptOutput = getExamPromptTemplate(watchedValues as any);

  const handleCopy = async () => {
    try {
      const currentValues = form.getValues();
      await navigator.clipboard.writeText(promptOutput);

      // Notify parent to update store
      onPersist(currentValues);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showNotifError({
        message: t(($) => $.exam.questions.jsonQuestions.promptGenerator.outputCard.copyError),
      });
      console.error("Failed to copy text: ", err);
    }
  };

  const formConfig = {
    curriculum: {
      type: "text",
      name: "curriculum",
      label: t(($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.curriculum),
      placeholder: t(
        ($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.curriculumPlaceholder,
      ),
    },
    grade: {
      type: "text",
      name: "grade",
      label: t(($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.grade),
      placeholder: t(
        ($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.gradePlaceholder,
      ),
    },
    subject: {
      type: "text",
      name: "subject",
      label: t(($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.subject),
      placeholder: t(
        ($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.subjectPlaceholder,
      ),
    },
    language: {
      type: "text",
      name: "language",
      label: t(($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.language),
      placeholder: t(
        ($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.languagePlaceholder,
      ),
    },
    sourceMaterial: {
      type: "textarea",
      name: "sourceMaterial",
      label: t(($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.sourceMaterial),
      placeholder: t(
        ($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.sourceMaterialPlaceholder,
      ),
      minRows: 3,
    },
  };

  return (
    <>
      <Form {...form}>
        <FormWithDetector
          form={form}
          onSubmit={() => {}} // We don't really submit, we just use the values for preview
          schema={formSchema}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {t(($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.title)}
              </CardTitle>
              <CardDescription>
                {t(($) => $.exam.questions.jsonQuestions.promptGenerator.paramsCard.description)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ControlForm form={form} item={formConfig.curriculum} showMessage={false} />

                <ControlForm form={form} item={formConfig.grade} showMessage={false} />

                <ControlForm form={form} item={formConfig.subject} showMessage={false} />

                <ControlForm form={form} item={formConfig.language} showMessage={false} />

                <div className="flex flex-col gap-2 md:col-span-2">
                  <ControlForm form={form} item={formConfig.sourceMaterial} showMessage={false} />

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground mr-1">
                      {t(
                        ($) =>
                          $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets.title,
                      )}
                      :
                    </span>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground gap-1.5 transition-colors h-7"
                      onClick={() =>
                        form.setValue(
                          "sourceMaterial",
                          t(
                            ($) =>
                              $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                .prompts.image,
                          ),
                          { shouldDirty: true },
                        )
                      }
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {t(
                        ($) =>
                          $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets.image,
                      )}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground gap-1.5 transition-colors h-7"
                      onClick={() =>
                        form.setValue(
                          "sourceMaterial",
                          t(
                            ($) =>
                              $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                .prompts.topic,
                          ),
                          { shouldDirty: true },
                        )
                      }
                    >
                      <Type className="w-3.5 h-3.5" />
                      {t(
                        ($) =>
                          $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets.topic,
                      )}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground gap-1.5 transition-colors h-7"
                      onClick={() =>
                        form.setValue(
                          "sourceMaterial",
                          t(
                            ($) =>
                              $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                .prompts.variation,
                          ),
                          { shouldDirty: true },
                        )
                      }
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {t(
                        ($) =>
                          $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                            .variation,
                      )}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground gap-1.5 transition-colors h-7"
                      onClick={() =>
                        form.setValue(
                          "sourceMaterial",
                          t(
                            ($) =>
                              $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                .prompts.bulk,
                          ),
                          { shouldDirty: true },
                        )
                      }
                    >
                      <Library className="w-3.5 h-3.5" />
                      {t(
                        ($) =>
                          $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets.bulk,
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FormWithDetector>
      </Form>

      <Card className="bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>
              {t(($) => $.exam.questions.jsonQuestions.promptGenerator.outputCard.title)}
            </CardTitle>
            <CardDescription>
              {t(($) => $.exam.questions.jsonQuestions.promptGenerator.outputCard.description)}
            </CardDescription>
          </div>
          <Button
            onClick={handleCopy}
            variant={copied ? "success" : "default"}
            className="min-w-32 transition-all"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t(($) => $.exam.questions.jsonQuestions.promptGenerator.outputCard.copiedButton)}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                {t(($) => $.exam.questions.jsonQuestions.promptGenerator.outputCard.copyButton)}
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative border rounded-md">
            <textarea
              readOnly
              value={promptOutput}
              className="font-mono text-xs w-full h-[600px] resize-y p-4 bg-background focus-visible:ring-0 outline-none"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
