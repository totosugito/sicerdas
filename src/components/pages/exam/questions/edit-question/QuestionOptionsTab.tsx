import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

export function QuestionOptionsTab() {
    return (
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
    );
}
