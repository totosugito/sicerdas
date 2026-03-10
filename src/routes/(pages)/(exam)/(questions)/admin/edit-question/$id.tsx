import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAppTranslation } from '@/lib/i18n-typed';
import { useMemo } from 'react';
import { z } from 'zod';
import { PageTitle, ErrorContainer, LoadingView } from '@/components/app';
import { AppRoute } from '@/constants/app-route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ListChecks, Lightbulb, Tag as TagIcon, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetQuestion, useUpdateQuestion } from '@/api/exam-questions';
import { QuestionSettingsForm } from '@/components/pages/exam/questions/edit-question/QuestionSettingsForm';
import { QuestionContentForm } from '@/components/pages/exam/questions/edit-question/QuestionContentForm';
import { QuestionOptionsTab } from '@/components/pages/exam/questions/edit-question/QuestionOptionsTab';
import { QuestionSolutionsTab } from '@/components/pages/exam/questions/edit-question/QuestionSolutionsTab';
import { QuestionTagsTab } from '@/components/pages/exam/questions/edit-question/QuestionTagsTab';
import { showNotifError, showNotifSuccess } from '@/lib/show-notif';

export const Route = createFileRoute('/(pages)/(exam)/(questions)/admin/edit-question/$id')({
    validateSearch: z.object({
        tab: z.string().optional().catch(undefined),
    }),
    component: AdminExamQuestionsEditPage,
});

function AdminExamQuestionsEditPage() {
    const { t } = useAppTranslation();
    const { id } = Route.useParams();

    const { data: questionData, isLoading, isError, error, refetch } = useGetQuestion(id);
    const updateMutation = useUpdateQuestion(id);
    const searchParams = Route.useSearch();
    const navigate = Route.useNavigate();

    const currentTab = searchParams.tab || 'settings';

    const handleTabChange = (value: string) => {
        navigate({
            search: { ...searchParams, tab: value },
            replace: true,
        });
    };

    const question = questionData?.data;

    const initialData = useMemo(() => {
        return {
            subjectId: question?.subjectId || "",
            passageId: question?.passageId || null,
            difficulty: question?.difficulty,
            type: question?.type,
            requiredTier: question?.requiredTier || "free",
            educationGradeId: question?.educationGradeId ? String(question.educationGradeId) : "",
            isActive: question?.isActive ?? true,
            content: question?.content || [],
        };
    }, [question]);

    const handleUpdate = async (values: any) => {
        try {
            await updateMutation.mutateAsync({
                ...values,
                educationGradeId: values.educationGradeId ? Number(values.educationGradeId) : undefined,
                requiredTier: values.requiredTier || undefined,
                passageId: values.passageId || undefined,
            });
            showNotifSuccess({ message: t($ => $.exam.questions.edit.success) });
            refetch();
        } catch (error: any) {
            showNotifError({
                message: error?.response?.data?.message || error?.message || "Terjadi kesalahan saat memperbarui data."
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <PageTitle
                    title={t($ => $.exam.questions.edit.title)}
                    description={t($ => $.exam.questions.edit.description)}
                    showBack
                    backTo={AppRoute.exam.questions.admin.list.url}
                />
                <LoadingView
                    title={t($ => $.exam.questions.edit.loadingTitle)}
                    message={t($ => $.exam.questions.edit.loading)}
                />
            </div>
        );
    }

    if (isError || !question) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <PageTitle
                    title={t($ => $.exam.questions.edit.title)}
                    description={t($ => $.exam.questions.edit.description)}
                    showBack
                    backTo={AppRoute.exam.questions.admin.list.url}
                />
                <ErrorContainer
                    title={t($ => $.exam.questions.edit.notFound.title)}
                    message={error?.message || t($ => $.exam.questions.edit.notFound.message)}
                    buttonText={t($ => $.exam.questions.edit.notFound.retryButton)}
                    onButtonClick={() => refetch()}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full pb-20">
            <PageTitle
                title={t($ => $.exam.questions.edit.title)}
                description={t($ => $.exam.questions.edit.description)}
                showBack
                backTo={AppRoute.exam.questions.admin.list.url}
            />

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px] mb-4">
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">{t($ => $.exam.questions.edit.tabs.settings)}</span>
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">{t($ => $.exam.questions.edit.tabs.content)}</span>
                    </TabsTrigger>
                    <TabsTrigger value="options" className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        <span className="hidden sm:inline">{t($ => $.exam.questions.edit.tabs.options)}</span>
                    </TabsTrigger>
                    <TabsTrigger value="solutions" className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        <span className="hidden sm:inline">{t($ => $.exam.questions.edit.tabs.solutions)}</span>
                    </TabsTrigger>
                    <TabsTrigger value="tags" className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{t($ => $.exam.questions.edit.tabs.tags)}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-0">
                    <Card className="border-t-0 rounded-t-none">
                        <CardHeader>
                            <CardTitle className="text-xl">{t($ => $.exam.questions.edit.settings.title)}</CardTitle>
                            <CardDescription>
                                {t($ => $.exam.questions.edit.settings.description)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <QuestionSettingsForm
                                defaultValues={initialData}
                                onSubmit={handleUpdate}
                                isPending={updateMutation.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="mt-0">
                    <Card className="border-t-0 rounded-t-none">
                        <CardHeader>
                            <CardTitle className="text-xl">{t($ => $.exam.questions.edit.content.title)}</CardTitle>
                            <CardDescription>
                                {t($ => $.exam.questions.edit.content.description)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <QuestionContentForm
                                defaultValues={initialData}
                                onSubmit={(content) => handleUpdate({ content })}
                                isPending={updateMutation.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Options Tab */}
                <TabsContent value="options" className="mt-0">
                    <QuestionOptionsTab />
                </TabsContent>

                {/* Solutions Tab */}
                <TabsContent value="solutions" className="mt-0">
                    <QuestionSolutionsTab />
                </TabsContent>

                {/* Tags Tab */}
                <TabsContent value="tags" className="mt-0">
                    <QuestionTagsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
