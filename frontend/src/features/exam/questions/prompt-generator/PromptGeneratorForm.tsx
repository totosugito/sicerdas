import React, { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Image as ImageIcon, Type, Layers, Library } from "lucide-react";
import { getExamPromptTemplate } from "@/data/prompt/exam-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showNotifError } from "@/lib/show-notif";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useAppForm } from "@/components/ui/form-tanstack";
import { ControlForm, FormWithDetector } from "@/components/forms";

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

  const form = useAppForm({
    defaultValues,
    validators: {
      onChange: formSchema as any,
    },
  });

  const handleCopy = async () => {
    try {
      const currentValues = form.state.values;
      const promptOutput = getExamPromptTemplate(currentValues);
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
    <form.Subscribe selector={(state: any) => state.values}>
      {(values: any) => {
        const promptOutput = getExamPromptTemplate(values);

        return (
          <>
            <form.AppForm>
              <FormWithDetector
                form={form}
                onSubmit={(e) => e.preventDefault()} // We don't really submit, we just use the values for preview
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
                      <form.AppField name="curriculum">
                        {(field) => <ControlForm field={field} item={formConfig.curriculum} showMessage={false} />}
                      </form.AppField>

                      <form.AppField name="grade">
                        {(field) => <ControlForm field={field} item={formConfig.grade} showMessage={false} />}
                      </form.AppField>

                      <form.AppField name="subject">
                        {(field) => <ControlForm field={field} item={formConfig.subject} showMessage={false} />}
                      </form.AppField>

                      <form.AppField name="language">
                        {(field) => <ControlForm field={field} item={formConfig.language} showMessage={false} />}
                      </form.AppField>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <form.AppField name="sourceMaterial">
                          {(field) => <ControlForm field={field} item={formConfig.sourceMaterial} showMessage={false} />}
                        </form.AppField>

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
                              form.setFieldValue(
                                "sourceMaterial",
                                t(
                                  ($) =>
                                    $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                      .prompts.image,
                                ),
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
                              form.setFieldValue(
                                "sourceMaterial",
                                t(
                                  ($) =>
                                    $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                      .prompts.topic,
                                ),
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
                              form.setFieldValue(
                                "sourceMaterial",
                                t(
                                  ($) =>
                                    $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                      .prompts.variation,
                                ),
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
                              form.setFieldValue(
                                "sourceMaterial",
                                t(
                                  ($) =>
                                    $.exam.questions.jsonQuestions.promptGenerator.paramsCard.presets
                                      .prompts.bulk,
                                ),
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
            </form.AppForm>

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
      }}
    </form.Subscribe>
  );
}
