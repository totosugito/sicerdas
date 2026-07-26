import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionSettingsForm } from './QuestionSettingsForm';
import { useAppTranslation } from '@/lib/i18n-typed';

interface QuestionSettingsTabProps {
    defaultValues: any;
    onSubmit: (values: any) => void;
    isPending: boolean;
}

export function QuestionSettingsTab({ defaultValues, onSubmit, isPending }: QuestionSettingsTabProps) {
    const { t } = useAppTranslation();
    return (
        <Card className="border-t-0 rounded-t-none">
            <CardHeader>
                <CardTitle className="text-xl">{t($ => $.exam.questions.edit.settings.title)}</CardTitle>
                <CardDescription>
                    {t($ => $.exam.questions.edit.settings.description)}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <QuestionSettingsForm
                    defaultValues={defaultValues}
                    onSubmit={onSubmit}
                    isPending={isPending}
                />
            </CardContent>
        </Card>
    );
}
