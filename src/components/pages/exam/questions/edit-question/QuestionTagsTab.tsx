import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';

export function QuestionTagsTab() {
    return (
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
    );
}
