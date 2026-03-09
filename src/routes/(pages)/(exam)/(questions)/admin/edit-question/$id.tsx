import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAppTranslation } from '@/lib/i18n-typed';
import { PageTitle } from '@/components/app';
import { AppRoute } from '@/constants/app-route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ListChecks, Lightbulb, Tag, Plus, Pencil, Trash2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGetQuestion, useUpdateQuestion } from '@/api/exam-questions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QuestionSettingsForm } from '@/components/pages/exam/questions/edit-question/QuestionSettingsForm';
import { QuestionContentForm } from '@/components/pages/exam/questions/edit-question/QuestionContentForm';
import { showNotifError, showNotifSuccess } from '@/lib/show-notif';

export const Route = createFileRoute('/(pages)/(exam)/(questions)/admin/edit-question/$id')({
    component: AdminExamQuestionsEditPage,
});

function AdminExamQuestionsEditPage() {
    const { t } = useAppTranslation();
    const { id } = Route.useParams();

    const { data: questionData, isLoading, isError, refetch } = useGetQuestion(id);
    const updateMutation = useUpdateQuestion(id);

    const question = questionData?.data;

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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Memuat data pertanyaan...</p>
            </div>
        );
    }

    if (isError || !question) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <PageTitle
                    title={t($ => $.exam.questions.edit.title)}
                    showBack
                    backTo={AppRoute.exam.questions.admin.list.url}
                />
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Gagal memuat data pertanyaan. Silakan coba lagi atau kembali ke daftar soal.
                    </AlertDescription>
                </Alert>
                <Button variant="outline" className="w-fit" onClick={() => refetch()}>
                    Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full pb-20">
            <PageTitle
                title={t($ => $.exam.questions.edit.title)}
                description={<span>{t($ => $.exam.questions.edit.description)}</span>}
                showBack
                backTo={AppRoute.exam.questions.admin.list.url}
            />

            <Tabs defaultValue="settings" className="w-full">
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
                        <Tag className="h-4 w-4" />
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
                        <CardContent className="pt-4">
                            <QuestionSettingsForm
                                question={question}
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
                        <CardContent className="pt-4">
                            <QuestionContentForm
                                question={question}
                                onSubmit={(content) => handleUpdate({ content })}
                                isPending={updateMutation.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Options Tab */}
                <TabsContent value="options" className="mt-0">
                    <Card className="border-t-0 rounded-t-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-xl">Pilihan Jawaban</CardTitle>
                                <CardDescription>
                                    Tambahkan dan tentukan pilihan jawaban untuk soal pilihan ganda.
                                </CardDescription>
                            </div>
                            <Button size="sm" className="gap-1.5 shadow-md hover:scale-105 transition-transform">
                                <Plus className="h-4 w-4" /> Tambah Pilihan
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Option Mock Item 1 */}
                            <div className="group relative border border-border rounded-xl p-5 bg-card hover:bg-accent/5 transition-all shadow-sm">
                                <div className="absolute -left-3 top-5 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg border-2 border-background z-10">A</div>
                                <div className="flex justify-between items-start mb-4 ml-3">
                                    <div className="h-24 w-full bg-muted/20 border border-dashed rounded-md flex items-center justify-center text-muted-foreground/40 italic text-sm">
                                        Konten Pilihan A...
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Badge variant="success" className="h-7 cursor-pointer hover:opacity-80 transition-opacity">Benar</Badge>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Option Mock Item 2 */}
                            <div className="group relative border border-border rounded-xl p-5 bg-card hover:bg-accent/5 transition-all shadow-sm opacity-60">
                                <div className="absolute -left-3 top-5 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold shadow-md border-2 border-background z-10">B</div>
                                <div className="flex justify-between items-start mb-4 ml-3">
                                    <div className="h-16 w-full bg-muted/10 border border-dashed rounded-md flex items-center justify-center text-muted-foreground/30 italic text-xs">
                                        Konten Pilihan B...
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Badge variant="outline" className="h-7 text-muted-foreground border-dashed">Salah</Badge>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Solutions Tab */}
                <TabsContent value="solutions" className="mt-0">
                    <Card className="border-t-0 rounded-t-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-center sm:text-left">
                            <div>
                                <CardTitle className="text-xl">Pembahasan & Solusi</CardTitle>
                                <CardDescription>
                                    Berikan penjelasan langkah demi langkah dan tips untuk menjawab soal.
                                </CardDescription>
                            </div>
                            <Button size="sm" variant="outline" className="gap-1.5 border-primary text-primary hover:bg-primary/5 shadow-sm">
                                <Plus className="h-4 w-4" /> Solusi Baru
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Solution Mock Item 1 */}
                                <div className="border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="bg-primary/5 px-5 py-3 border-b border-border flex justify-between items-center group-hover:bg-primary/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                                <Lightbulb className="h-4 w-4" />
                                            </div>
                                            <span className="font-semibold text-primary">Cara Umum</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="font-normal">Free Tier</Badge>
                                            <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="space-y-3">
                                            <div className="h-3 w-full bg-muted/30 rounded-full animate-pulse"></div>
                                            <div className="h-3 w-[90%] bg-muted/30 rounded-full animate-pulse"></div>
                                            <div className="h-3 w-[95%] bg-muted/30 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-center">
                                <div className="text-muted-foreground text-sm italic py-8 px-12 border-2 border-dashed rounded-2xl w-full max-w-lg text-center bg-muted/5">
                                    Klik tombol "Solusi Baru" untuk menambahkan pembahasan tambahan seperti trik cepat atau tips khusus.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tags Tab */}
                <TabsContent value="tags" className="mt-0">
                    <Card className="border-t-0 rounded-t-none">
                        <CardHeader>
                            <CardTitle className="text-xl">Tagging Materi</CardTitle>
                            <CardDescription>
                                Hubungkan soal dengan kategori materi atau konsep tertentu untuk keperluan analisis & adaptif learning.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-8">
                            <div className="max-w-2xl mx-auto space-y-8 bg-muted/5 p-8 border border-dashed rounded-3xl">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-base">
                                        <Tag className="h-4 w-4 text-primary" /> Pilih Tag Materi
                                    </Label>
                                    <div className="relative group">
                                        <div className="h-14 w-full bg-background rounded-2xl border-2 border-muted hover:border-primary/30 transition-all flex items-center px-5 text-muted-foreground gap-3 shadow-inner">
                                            <span className="h-8 w-px bg-muted-foreground/20"></span>
                                            <span className="italic">Ketik untuk mencari materi (e.g. Aljabar, Trigonometri)...</span>
                                        </div>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">⌘K</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Tag Saat Ini</Label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {["Matematika Dasar", "Logika", "SBMPTN"].map(tag => (
                                            <Badge key={tag} className="pl-3 pr-2 py-1.5 rounded-xl bg-primary/10 text-primary border-primary/20 gap-1.5 hover:bg-primary/15 whitespace-nowrap group cursor-default">
                                                {tag}
                                                <span className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] group-hover:bg-primary/40 cursor-pointer">✕</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
