import { UserItem, useUpdateUserAvatar } from "@/api/users";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageCropper, FileWithPreview } from "@/components/custom/components";
import { useDropzone, FileWithPath } from "react-dropzone";
import { useCallback, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Camera, Loader2 } from "lucide-react";

interface DialogUserAvatarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
}

export function DialogUserAvatar({ open, onOpenChange, user }: DialogUserAvatarProps) {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const avatarMutation = useUpdateUserAvatar();

  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [isCropperOpen, setCropperOpen] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    setSelectedFile(fileWithPreview);
    setCropperOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleUpload = (file: File) => {
    if (!user) return;
    avatarMutation.mutate(
      { id: user.id, file },
      {
        onSuccess: () => {
          showNotifSuccess({ message: t(($) => $.user.management.notifications.updateSuccess) });
          queryClient.invalidateQueries({ queryKey: ["users-list"] });
          // Reset states
          setCroppedFile(null);
          setCroppedPreview(null);
          setSelectedFile(null);
          onOpenChange(false);
        },
        onError: (err: any) => {
          showNotifError({ message: err.message || t(($) => $.labels.error) });
        },
      },
    );
  };

  const onCropComplete = (file: File) => {
    setCroppedFile(file);
    setCroppedPreview(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    if (!user) return;
    avatarMutation.mutate(
      { id: user.id, action: "remove" },
      {
        onSuccess: () => {
          showNotifSuccess({ message: t(($) => $.user.management.notifications.updateSuccess) });
          queryClient.invalidateQueries({ queryKey: ["users-list"] });
          onOpenChange(false);
        },
        onError: (err: any) => {
          showNotifError({ message: err.message || t(($) => $.labels.error) });
        },
      },
    );
  };

  if (!open || !user) return null;

  const handleInternalOpenChange = (open: boolean) => {
    if (!open) {
      setCroppedFile(null);
      setCroppedPreview(null);
      setSelectedFile(null);
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleInternalOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t(($) => $.user.management.dialog.changeAvatarTitle)}</DialogTitle>
            <DialogDescription>{user.name}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-6">
            <div className="relative group">
              <Avatar className="h-56 w-56 border-2 border-muted shadow-sm ring-offset-background transition-all group-hover:ring-2 group-hover:ring-primary/20">
                <AvatarImage src={croppedPreview || user.image} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold bg-muted text-muted-foreground uppercase">
                  {user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div
                {...getRootProps()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <input {...getInputProps()} />
                <Camera className="h-8 w-8" />
              </div>
            </div>

            <div className="text-center flex flex-col items-center gap-1">
              <p className="text-sm text-foreground font-semibold">
                {croppedFile ? croppedFile.name : t(($) => $.user.management.dialog.avatarInfo)}
              </p>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max. 2MB)</p>
            </div>

            <div className="flex flex-col w-full gap-2">
              {user.image && !croppedFile && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  onClick={handleRemove}
                  disabled={avatarMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t(($) => $.user.management.dialog.deleteAvatar)}
                </Button>
              )}
            </div>
          </div>
          <DialogFooter className="gap-4">
            <Button
              onClick={() => croppedFile && handleUpload(croppedFile)}
              disabled={!croppedFile || avatarMutation.isPending}
              className="w-full sm:w-auto"
            >
              {avatarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t(($) => $.labels.save)}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleInternalOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {t(($) => $.labels.cancel)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedFile && (
        <ImageCropper
          dialogOpen={isCropperOpen}
          setDialogOpen={setCropperOpen}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onCropComplete={onCropComplete}
          title={t(($) => $.user.management.dialog.changeAvatarTitle)}
        />
      )}
    </>
  );
}
