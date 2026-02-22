import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { ExamCategory } from "@/api/exam/categories";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: ExamCategory | null;
    onSubmit: (values: FormValues) => void;
    isPending?: boolean;
}

export function CategoryDialog({
    open,
    onOpenChange,
    category,
    onSubmit,
    isPending,
}: CategoryDialogProps) {
    const { t } = useTranslation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                description: category.description || "",
                isActive: category.isActive,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                isActive: true,
            });
        }
    }, [category, form, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {category ? t("common.edit") : t("common.add")} {t("exam.categories.title", "Kategori")}
                    </DialogTitle>
                    <DialogDescription>
                        {category
                            ? t("exam.categories.editDescription", "Perbarui informasi kategori ujian di bawah ini.")
                            : t("exam.categories.createDescription", "Tambahkan kategori ujian baru untuk mengelompokkan paket soal.")}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.name")}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: UTBK SNBT 2026" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("common.description")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Deskripsi singkat mengenai kategori ini..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>{t("common.activeStatus")}</FormLabel>
                                        <FormDescription>
                                            {t("exam.categories.activeDescription", "Kategori yang aktif dapat dilihat oleh pengguna.")}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? t("common.saving") : t("common.save")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
