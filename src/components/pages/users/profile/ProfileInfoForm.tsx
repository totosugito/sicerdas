import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppTranslation, AppTranslation } from "@/lib/i18n-typed";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { z } from "zod";
import { ImageCropper, FileWithPreview } from "@/components/ui/image-cropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDropzone } from "react-dropzone";
import { useCallback, useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";

// Define the form values type
export type ProfileInfoFormValues = {
  name: string;
  email: string;
  bio: string;
  image: string | null;
};

const accept = {
  "image/*": [],
};

// Define a function to create form data with translations
const createProfileInfoFormData = (t: AppTranslation) => {
  return {
    form: {
      name: {
        type: "text",
        name: "name",
        label: t(($) => $.user.profile.information.fullName),
        placeholder: t(($) => $.user.profile.information.fullNamePlaceholder),
      },
      email: {
        type: "email",
        name: "email",
        label: t(($) => $.user.profile.information.emailAddress),
        placeholder: t(($) => $.user.profile.information.emailPlaceholder),
      },
      bio: {
        type: "textarea",
        name: "bio",
        label: t(($) => $.user.profile.information.bio),
        placeholder: t(($) => $.user.profile.information.bioPlaceholder),
        minRows: 5,
      },
    },
    schema: z.object({
      name: z.string().min(2, { message: t(($) => $.user.profile.information.fullNameError) }),
      email: z.string().email({ message: t(($) => $.user.profile.information.emailError) }),
      bio: z.string().optional(),
      image: z.string().nullable().optional(),
    }),
    defaultValue: {
      name: "",
      email: "",
      bio: "",
      image: null,
    } satisfies ProfileInfoFormValues,
  };
};

interface ProfileInfoFormProps {
  form: any;
  onSubmit: (values: any, avatarFile: File | null) => void;
  error?: string | null;
  defaultValues: Record<string, any>;
}

// Add ref interface
export interface ProfileInfoFormRef {
  resetImageState: () => void;
}

export const ProfileInfoForm = forwardRef<ProfileInfoFormRef, ProfileInfoFormProps>(
  ({ form, onSubmit, error, defaultValues }, ref) => {
    const { t } = useAppTranslation();
    const originalValues = useRef<Record<string, any>>({});

    useEffect(() => {
      if (defaultValues) {
        originalValues.current = defaultValues;
      }
    }, [defaultValues]);

    // Create form data with translated labels and placeholders
    const formData = createProfileInfoFormData(t);

    // Define form items
    const formItems = formData.form;

    // Handle form submission - only send changed fields
    const handleSubmit = (values: Record<string, any>) => {
      const orig = originalValues.current;
      const changedValues: Record<string, any> = {};

      Object.keys(formItems).forEach((key) => {
        if (key === "image") return;
        const val = values[key];
        const origVal = orig[key];

        const currentStr = val ?? "";
        const originalStr = origVal ?? "";
        if (currentStr !== originalStr) {
          changedValues[key] = currentStr;
        }
      });

      onSubmit(changedValues, hasImageChanged ? croppedImageFile : null);
    };

    // Expose function to reset image state
    const resetImageState = () => {
      setSelectedFile(null);
      setDialogOpen(false);
      setHasImageChanged(false);
      setCroppedImageFile(null);
    };

    // Reset image changed flag when form is reset
    useEffect(() => {
      if (!form.state.isDirty) {
        setHasImageChanged(false);
        setCroppedImageFile(null);
      }
    }, [form.state.isDirty]);

    // Expose reset function through ref
    useImperativeHandle(ref, () => ({
      resetImageState,
    }));

    const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [hasImageChanged, setHasImageChanged] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) {
          alert("Selected image is too large!");
          return;
        }

        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setSelectedFile(fileWithPreview);
        setDialogOpen(true);
      },
      [],
    );

    const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept,
    });

    return (
      <Card className="w-full">
        <CardHeader className="border-b">
          <CardTitle>
            {t(($) => $.user.profile.information.title)}
          </CardTitle>
        </CardHeader>
        <form.AppForm>
          <FormWithDetector
            form={form}
            onSubmit={handleSubmit}
            className="w-full"
            errorClassName="mx-6"
            error={error}
          >
            <CardContent>
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
                        title={t(($) => $.user.profile.information.changeAvatar)}
                        onCropComplete={(file: File) => setCroppedImageFile(file)}
                      />
                    ) : (
                      <Avatar
                        {...getRootProps()}
                        className="size-32 cursor-pointer ring-offset-2 ring-2 ring-slate-200"
                      >
                        <input {...getInputProps()} />
                        <AvatarImage
                          src={form.state.values.image || ""}
                          alt={form.state.values.name || ""}
                        />
                        <AvatarFallback className="text-4xl">
                          {(form.state.values.name || "").substring(0, 2).toUpperCase() || "CN"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                <div className="grid w-full gap-4">
                  <form.AppField name="name">
                    {(field: any) => (
                      <ControlForm field={field} item={formItems.name} showMessage={false} />
                    )}
                  </form.AppField>

                  <form.AppField name="email">
                    {(field: any) => (
                      <ControlForm
                        field={field}
                        item={formItems.email}
                        disabled={true}
                        showMessage={false}
                      />
                    )}
                  </form.AppField>
                </div>
              </div>

              <form.AppField name="bio">
                {(field: any) => (
                  <ControlForm field={field} item={formItems.bio} showMessage={false} />
                )}
              </form.AppField>
            </CardContent>
            <CardFooter className="justify-end gap-4 border-t">
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
                {t(($) => $.labels.cancel)}
              </Button>
              <Button type="submit" variant="default">
                {t(($) => $.labels.save)}
              </Button>
            </CardFooter>
          </FormWithDetector>
        </form.AppForm>
      </Card>
    );
  },
);

export { createProfileInfoFormData };
