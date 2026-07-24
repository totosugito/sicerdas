import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppTranslation } from "@/lib/i18n-typed";
import { FormWithDetector } from "@/components/custom/forms";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ControlForm } from "@/components/custom/forms/ControlForm";
import { CreateTierParams } from "@/api/tier";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreateTierFormProps {
    onSubmit: (data: CreateTierParams) => void;
    isLoading?: boolean;
    onCancel?: () => void;
    error?: string | null;
    defaultValues?: Partial<CreateTierParams>;
}

export const CreateTierForm = ({ onSubmit, isLoading = false, onCancel, error, defaultValues }: CreateTierFormProps) => {
    const { t } = useAppTranslation();

    const formSchema = z.object({
        slug: z.string()
            .min(1, { message: t($ => $.tier.create.validation.slugRequired) })
            .regex(/^[a-z0-9-]+$/, { message: t($ => $.tier.create.validation.slugInvalid) }),
        name: z.string().min(1, { message: t($ => $.tier.create.validation.nameRequired) }),
        price: z.coerce.number()
            .min(0, { message: t($ => $.tier.create.validation.priceRequired) })
            .refine((val) => !isNaN(val), { message: t($ => $.tier.create.validation.priceInvalid) }),
        currency: z.string().min(1, { message: t($ => $.tier.create.validation.currencyRequired) }),
        billingCycle: z.string().min(1, { message: t($ => $.tier.create.validation.billingCycleRequired) }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            slug: defaultValues?.slug || "",
            name: defaultValues?.name || "",
            price: defaultValues?.price ? Number(defaultValues.price) : 0,
            currency: defaultValues?.currency || "IDR",
            billingCycle: defaultValues?.billingCycle || "monthly",
        },
    });

    // Reset form when defaultValues changes
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                slug: defaultValues.slug || "",
                name: defaultValues.name || "",
                price: defaultValues.price ? Number(defaultValues.price) : 0,
                currency: defaultValues.currency || "IDR",
                billingCycle: defaultValues.billingCycle || "monthly",
            });
        }
    }, [defaultValues, form]);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const data: CreateTierParams = {
            slug: values.slug,
            name: values.name,
            price: values.price?.toString(),
            currency: values.currency,
            billingCycle: values.billingCycle,
            features: defaultValues?.features || [],
            limits: (defaultValues?.limits as any) || {
                chatAi: {
                    daily_messages: 100,
                    max_tokens: 4000,
                }
            },
            isActive: defaultValues?.isActive ?? false,
            isPopular: defaultValues?.isPopular ?? false,
            sortOrder: defaultValues?.sortOrder ?? -1,
        };

        onSubmit(data);
    };

    const basicInfoFields = [
        {
            name: "slug",
            label: t($ => $.tier.create.form.slug),
            placeholder: t($ => $.tier.create.form.slugPlaceholder),
            description: t($ => $.tier.create.form.slugDescription),
            type: "text",
            required: true,
            disabled: !!defaultValues,
        },
        {
            name: "name",
            label: t($ => $.tier.create.form.name),
            placeholder: t($ => $.tier.create.form.namePlaceholder),
            description: t($ => $.tier.create.form.nameDescription),
            type: "text",
            required: true,
        },
        {
            name: "price",
            label: t($ => $.tier.create.form.price),
            placeholder: t($ => $.tier.create.form.pricePlaceholder),
            description: t($ => $.tier.create.form.priceDescription),
            type: "number",
        },
        {
            name: "currency",
            label: t($ => $.tier.create.form.currency),
            placeholder: t($ => $.tier.create.form.currencyPlaceholder),
            description: t($ => $.tier.create.form.currencyDescription),
            type: "select",
            options: [
                { value: "IDR", label: "IDR" },
                { value: "USD", label: "USD" },
            ],
        },
        {
            name: "billingCycle",
            label: t($ => $.tier.create.form.billingCycle),
            placeholder: t($ => $.tier.create.form.billingCyclePlaceholder),
            description: t($ => $.tier.create.form.billingCycleDescription),
            type: "select",
            options: [
                { value: "monthly", label: t($ => $.tier.create.form.billingCycleOptions.monthly) },
                { value: "quarterly", label: t($ => $.tier.create.form.billingCycleOptions.quarterly) },
                { value: "semiAnnually", label: t($ => $.tier.create.form.billingCycleOptions.semiAnnually) },
                { value: "annually", label: t($ => $.tier.create.form.billingCycleOptions.annually) },
            ],
        },
    ];

    return (
        <Form {...form}>
            <FormWithDetector form={form} onSubmit={handleSubmit} schema={formSchema}>
                <Card className="pb-0 gap-0">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
                        <CardTitle>{t($ => $.tier.create.form.basicInfo)}</CardTitle>
                        <CardDescription>{t($ => $.tier.create.form.basicInfoDescription)}</CardDescription>
                    </CardHeader>
                    <CardContent className="">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{t($ => $.tier.create.messages.error)}</AlertTitle>
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {basicInfoFields.map((field) => (
                            <ControlForm
                                key={field.name}
                                form={form}
                                item={field}
                                disabled={isLoading || field.disabled}
                                showMessage={false}
                            />
                        ))}

                        {/* Info Message */}
                        {!defaultValues && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border mt-4">
                                💡 {t($ => $.tier.create.form.createNote)}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-end items-center gap-3 bg-muted/30 border-t [.border-t]:pb-6">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                {t($ => $.tier.create.buttons.cancel)}
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {defaultValues ? t($ => $.tier.edit.buttons.saving) : t($ => $.tier.create.buttons.creating)}
                                </>
                            ) : (
                                defaultValues ? t($ => $.tier.edit.buttons.save) : t($ => $.tier.create.buttons.create)
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </FormWithDetector>
        </Form>
    );
};
