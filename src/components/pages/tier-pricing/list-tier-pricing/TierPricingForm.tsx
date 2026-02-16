import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { useCreateTierPricing, useUpdateTierPricing, TierPricing } from "@/api/tier-pricing"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    price: z.string().min(1, "Price is required"),
    currency: z.string().default("IDR"),
    billingCycle: z.string().default("monthly"),
    sortOrder: z.coerce.number().default(0),
    isActive: z.boolean().default(true),
    // Features and limits could be more complex (arrays/objects), strictly implementation would need dynamic fields.
    // Simplifying for now or we could add a simple comma-separated string for features.
    featuresString: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TierPricingFormProps {
    initialData?: TierPricing
    isEditing?: boolean
}

export function TierPricingForm({ initialData, isEditing = false }: TierPricingFormProps) {
    const navigate = useNavigate()
    const createMutation = useCreateTierPricing()
    const updateMutation = useUpdateTierPricing()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            price: "0",
            currency: "IDR",
            billingCycle: "monthly",
            sortOrder: 0,
            isActive: true,
            featuresString: "",
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                slug: initialData.slug,
                price: initialData.price,
                currency: initialData.currency,
                billingCycle: initialData.billingCycle,
                sortOrder: initialData.sortOrder,
                isActive: initialData.isActive,
                featuresString: initialData.features?.join('\n') ?? '', // Use newline for textarea
            })
        }
    }, [initialData, form])

    function onSubmit(values: FormValues) {
        const payload = {
            ...values,
            features: values.featuresString ? values.featuresString.split('\n').filter(Boolean) : [],
        }

        if (isEditing && initialData) {
            updateMutation.mutate({ slug: initialData.slug, ...payload }, {
                onSuccess: () => {
                    toast.success("Tier pricing updated successfully")
                    navigate({ to: "/admin/tier-pricing" })
                },
                onError: (error: any) => {
                    toast.error(error?.message || "Failed to update tier pricing")
                }
            })
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("Tier pricing created successfully")
                    navigate({ to: "/admin/tier-pricing" })
                },
                onError: (error: any) => {
                    toast.error(error?.message || "Failed to create tier pricing")
                }
            })
        }
    }

    const { isSubmitting } = form.formState

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Pro Plan" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                                <Input placeholder="pro-plan" {...field} disabled={isEditing} />
                            </FormControl>
                            <FormDescription>
                                Unique identifier for the tier used in code and URLs.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <FormControl>
                                    <Input placeholder="IDR" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="billingCycle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Cycle</FormLabel>
                                <FormControl>
                                    <Input placeholder="monthly" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sortOrder"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sort Order</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <FormDescription>
                                    Disabling this will hide the tier from public view.
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

                {/* Simple Text Area for Features - One per line */}
                <FormField
                    control={form.control}
                    name="featuresString"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Features (One per line)</FormLabel>
                            <FormControl>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isSubmitting}>
                    {isEditing ? "Update Tier" : "Create Tier"}
                </Button>
            </form>
        </Form>
    )
}
