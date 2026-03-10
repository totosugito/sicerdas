import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Pencil } from 'lucide-react';
import { ExamQuestion } from '@/api/exam-questions';
import { useAppTranslation } from '@/lib/i18n-typed';

interface QuestionSolutionsTabProps {
    solutions?: ExamQuestion['solutions'];
}

export function QuestionSolutionsTab({ solutions }: QuestionSolutionsTabProps) {
    const { t } = useAppTranslation();
    return (
        <Card className="border-t-0 rounded-t-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 text-center sm:text-left">
                <div>
                    <CardTitle className="text-xl">
                        {t($ => $.exam.questions.edit.solutions.title)}
                    </CardTitle>
                    <CardDescription>
                        {t($ => $.exam.questions.edit.solutions.description)}
                    </CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 border-primary text-primary hover:bg-primary/5 shadow-sm">
                    <Plus className="h-4 w-4" /> {t($ => $.exam.questions.edit.solutions.addButton)}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {solutions && solutions.length > 0 ? (
                        solutions.map((solution) => (
                            <div key={solution.id} className="border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                <div className="bg-primary/5 px-5 py-3 border-b border-border flex justify-between items-center group-hover:bg-primary/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                            <Lightbulb className="h-4 w-4" />
                                        </div>
                                        <span className="font-semibold text-primary">{solution.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-normal capitalize">
                                            {solution.requiredTier || 'Free Tier'}
                                        </Badge>
                                        <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="text-sm text-foreground/80">
                                        {/* Simplified preview for now */}
                                        Penjelasan solusi tersedia...
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pt-4 flex justify-center">
                            <div className="text-muted-foreground text-sm italic py-8 px-12 border-2 border-dashed rounded-2xl w-full max-w-lg text-center bg-muted/5">
                                {t($ => $.exam.questions.edit.solutions.empty)}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
