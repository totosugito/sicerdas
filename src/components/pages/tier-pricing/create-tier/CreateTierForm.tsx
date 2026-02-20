import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { FormWithDetector } from "@/components/custom/components";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ControlForm } from "@/components/custom/forms/ControlForm";
import { CreateTierPricingRequest } from "@/api/tier-pricing/admin/create-tier-pricing";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CreateTierFormProps {
    onSubmit: (data: CreateTierPricingRequest) => void;
    isLoading?: boolean;
    onCancel?: () => void;
    error?: string | null;
}

export const CreateTierForm = ({ onSubmit, isLoading = false, onCancel, error }: CreateTierFormProps) => {
    const { t } = useTranslation();

    const formSchema = z.object({
        slug: z.string()
            .min(1, { message: t('tierPricing.createTier.validation.slugRequired') })
            .regex(/^[a-z0-9-]+$/, { message: t('tierPricing.createTier.validation.slugInvalid') }),
        name: z.string().min(1, { message: t('tierPricing.createTier.validation.nameRequired') }),
        price: z.number()
            .min(0, { message: t('tierPricing.createTier.validation.priceRequired') })
            .refine((val) => !isNaN(val), { message: t('tierPricing.createTier.validation.priceInvalid') }),
        currency: z.string().min(1, { message: t('tierPricing.createTier.validation.currencyRequired') }),
        billingCycle: z.string().min(1, { message: t('tierPricing.createTier.validation.billingCycleRequired') }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            slug: "",
            name: "",
            price: 0,
            currency: "IDR",
            billingCycle: "monthly",
        },
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const data: CreateTierPricingRequest = {
            slug: values.slug,
            name: values.name,
            price: values.price?.toString(),
            currency: values.currency,
            billingCycle: values.billingCycle,
            features: [],
            limits: {
                chatAi: {
                    daily_messages: 100,
                    max_tokens: 4000,
                }
            },
            isActive: false,
            isPopular: false,
            sortOrder: -1,
        };

        onSubmit(data);
    };

    const basicInfoFields = [
        {
            name: "slug",
            label: t('tierPricing.createTier.form.slug'),
            placeholder: t('tierPricing.createTier.form.slugPlaceholder'),
            description: t('tierPricing.createTier.form.slugDescription'),
            type: "text",
        },
        {
            name: "name",
            label: t('tierPricing.createTier.form.name'),
            placeholder: t('tierPricing.createTier.form.namePlaceholder'),
            description: t('tierPricing.createTier.form.nameDescription'),
            type: "text",
        },
        {
            name: "price",
            label: t('tierPricing.createTier.form.price'),
            placeholder: t('tierPricing.createTier.form.pricePlaceholder'),
            description: t('tierPricing.createTier.form.priceDescription'),
            type: "number",
        },
        {
            name: "currency",
            label: t('tierPricing.createTier.form.currency'),
            placeholder: t('tierPricing.createTier.form.currencyPlaceholder'),
            description: t('tierPricing.createTier.form.currencyDescription'),
            type: "select",
            options: [
                { value: "IDR", label: "IDR" },
                { value: "USD", label: "USD" },
            ],
        },
        {
            name: "billingCycle",
            label: t('tierPricing.createTier.form.billingCycle'),
            placeholder: t('tierPricing.createTier.form.billingCyclePlaceholder'),
            description: t('tierPricing.createTier.form.billingCycleDescription'),
            type: "select",
            options: [
                { value: "monthly", label: t('tierPricing.createTier.form.billingCycleOptions.monthly') },
                { value: "quarterly", label: t('tierPricing.createTier.form.billingCycleOptions.quarterly') },
                { value: "semiAnnually", label: t('tierPricing.createTier.form.billingCycleOptions.semiAnnually') },
                { value: "annually", label: t('tierPricing.createTier.form.billingCycleOptions.annually') },
            ],
        },
    ];

    return (
        <Form {...form}>
            <FormWithDetector form={form} onSubmit={handleSubmit} schema={formSchema}>
                <Card className="pb-0 gap-0">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
                        <CardTitle>{t('tierPricing.createTier.form.basicInfo')}</CardTitle>
                        <CardDescription>{t('tierPricing.createTier.form.basicInfoDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 py-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{t('tierPricing.createTier.messages.error')}</AlertTitle>
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
                                disabled={isLoading}
                                showMessage={false}
                            />
                        ))}

                        {/* Info Message */}
                        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border mt-4">
                            💡 {t('tierPricing.createTier.form.createNote')}
                        </div>
                    </CardContent>

                    {form.formState.isDirty && (
                        <CardFooter className="flex justify-end items-center gap-3 bg-muted/30 border-t [.border-t]:pb-6">
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                >
                                    {t('tierPricing.createTier.buttons.cancel')}
                                </Button>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('tierPricing.createTier.buttons.creating')}
                                    </>
                                ) : (
                                    t('tierPricing.createTier.buttons.create')
                                )}
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </FormWithDetector>
        </Form>
    );
};
