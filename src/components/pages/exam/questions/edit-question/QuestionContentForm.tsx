import React, { useEffect } from 'react';
import { useAppTranslation } from '@/lib/i18n-typed';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { ControlForm } from '@/components/custom/forms';
import { FormWithDetector } from '@/components/custom/components';

type QuestionContentFormProps = {
    defaultValues: any;
    onSubmit: (content: any[]) => void;
    isPending?: boolean;
};

const formSchema = z.object({
    content: z.array(z.record(z.string(), z.unknown())).min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionContentForm({ defaultValues, onSubmit, isPending }: QuestionContentFormProps) {
    const { t } = useAppTranslation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: defaultValues.content || [],
        },
    });

    useEffect(() => {
        if (defaultValues.content) {
            form.reset({ content: defaultValues.content });
        }
    }, [defaultValues.content, form]);

    const onFormSubmit = (values: FormValues) => {
        onSubmit(values.content);
    };

    const formConfig = {
        content: {
            type: "blocknote",
            name: "content",
            label: t($ => $.exam.questions.form.content.label),
            placeholder: t($ => $.exam.questions.form.content.placeholder),
            wrapperClassName: "min-h-[500px]",
        }
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

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={isPending}
                    >
                        {t($ => $.labels.cancel)}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? t($ => $.labels.saving) : t($ => $.labels.save)}
                    </Button>
                </div>
            </FormWithDetector>
        </Form>
    );
}
