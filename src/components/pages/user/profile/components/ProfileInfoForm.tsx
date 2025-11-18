import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useTranslation } from 'react-i18next'
import { ControlForm } from '@/components/custom/forms'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { ImageCropper } from '@/components/custom/components'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileWithPath, useDropzone } from 'react-dropzone'
import { FileWithPreview } from '@/components/custom/components/image-cropper'
import { useCallback, useState, useEffect, useImperativeHandle, forwardRef, Ref } from 'react'

// Define the form values type
export type ProfileInfoFormValues = {
    name: string
    email: string
    bio: string,
    image: string | null
}

const accept = {
    "image/*": [],
}

// Define a function to create form data with translations
const createProfileInfoFormData = (t: (key: string) => string) => {
    return {
        form: {
            name: {
                type: "text",
                name: "name",
                label: t("user.profile.information.fullName"),
                placeholder: t("user.profile.information.fullNamePlaceholder"),
            },
            email: {
                type: "email",
                name: "email",
                label: t("user.profile.information.emailAddress"),
                placeholder: t("user.profile.information.emailPlaceholder"),
            },
            bio: {
                type: "textarea",
                name: "bio",
                label: t("user.profile.information.bio"),
                placeholder: t("user.profile.information.bioPlaceholder"),
                minRows: 5
            }
        },
        schema: z.object({
            name: z.string().min(2, { message: t("user.profile.information.fullNameError") }),
            email: z.email({ message: t("user.profile.information.emailError") }),
            bio: z.string().optional(),
            image: z.string().nullable().optional(),
        }),
        defaultValue: {
            name: "",
            email: "",
            bio: "",
            image: null,
        } satisfies ProfileInfoFormValues
    }
}

interface ProfileInfoFormProps {
    form: any
    onSubmit: (values: any, avatarFile: File | null) => void
    error?: string | null
}

// Add ref interface
export interface ProfileInfoFormRef {
    resetImageState: () => void
}

export const ProfileInfoForm = forwardRef<ProfileInfoFormRef, ProfileInfoFormProps>(({ form, onSubmit, error }, ref) => {
    const { t } = useTranslation()

    // Create form data with translated labels and placeholders
    const formData = createProfileInfoFormData(t)

    // Define form items
    const formItems = formData.form

    // Handle form submission
    const handleSubmit = (values: Record<string, any>) => {
        const {image, ...rest} = values;
        onSubmit(rest, croppedImageFile);
    }

    // Expose function to reset image state
    const resetImageState = () => {
        setSelectedFile(null);
        setDialogOpen(false);
        setHasImageChanged(false);
        setCroppedImageFile(null);
    }

    // Reset image changed flag when form is reset
    useEffect(() => {
        if (!form.formState.isDirty) {
            setHasImageChanged(false);
            setCroppedImageFile(null);
        }
    }, [form.formState.isDirty]);

    // Expose reset function through ref
    useImperativeHandle(ref, () => ({
        resetImageState
    }));

    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [hasImageChanged, setHasImageChanged] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            const file = acceptedFiles[0]
            if (!file) {
                alert("Selected image is too large!")
                return
            }

            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file),
            })

            setSelectedFile(fileWithPreview)
            setDialogOpen(true)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept,
    })

    // Determine if form has changes (either form fields are dirty or an image has been changed)
    const hasChanges = form.formState.isDirty || hasImageChanged;

    return (
        <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pb-0">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
                <CardTitle className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
                    {t("user.profile.information.title")}
                </CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <CardContent className="px-6 pb-6 space-y-6 w-full">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-300">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-6 md:flex-row">
                            <div className="flex flex-col items-center gap-3">
                                <div className="">
                                    {selectedFile ? (
                                        <ImageCropper
                                            dialogOpen={isDialogOpen}
                                            setDialogOpen={(open) => {
                                                setDialogOpen(open);
                                                // When dialog closes and we have a cropped image, mark as changed
                                                if (!open && selectedFile) {
                                                    setHasImageChanged(true);
                                                }
                                            }}
                                            selectedFile={selectedFile}
                                            setSelectedFile={setSelectedFile}
                                            title={t("user.profile.information.changeAvatar")}
                                            onCropComplete={(file: File) => setCroppedImageFile(file)}
                                        />
                                    ) : (
                                        <Avatar
                                            {...getRootProps()}
                                            className="size-32 cursor-pointer ring-offset-2 ring-2 ring-slate-200"
                                        >
                                            <input {...getInputProps()} />
                                            <AvatarImage src={form?.getValues?.("image") || ""} alt={form?.getValues?.("name") || ""} />
                                            <AvatarFallback className='text-4xl'>CN</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </div>

                            <div className="grid w-full gap-4">
                                <ControlForm
                                    form={form}
                                    item={formItems.name}
                                />

                                <ControlForm
                                    form={form}
                                    item={formItems.email}
                                    disabled={true}
                                />
                            </div>
                        </div>

                        <ControlForm
                            form={form}
                            item={formItems.bio}
                        />
                    </CardContent>
                    {hasChanges && (<CardFooter className="p-6 flex justify-end items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-b-xl border-t border-slate-200 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                setHasImageChanged(false);
                                setSelectedFile(null);
                                setCroppedImageFile(null);
                            }}
                        >
                            {t("labels.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                        >
                            {t("labels.save")}
                        </Button>
                    </CardFooter>)}
                </form>
            </Form>
        </Card>
    )
})

export { createProfileInfoFormData }