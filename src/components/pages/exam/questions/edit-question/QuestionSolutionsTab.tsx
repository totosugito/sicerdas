import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Pencil } from 'lucide-react';

export function QuestionSolutionsTab() {
    return (
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
    );
}
