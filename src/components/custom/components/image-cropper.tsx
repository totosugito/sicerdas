"use client";

import React, { type SyntheticEvent } from "react";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "@/lib/react-image-crop";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import "@/assets/ReactCrop.css";
import { CropIcon, Trash2Icon } from "lucide-react";
import { FileWithPath } from "react-dropzone";

export type FileWithPreview = FileWithPath & {
  preview: string;
};

interface ImageCropperProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: FileWithPreview | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  title?: string;
  onCropComplete?: (file: File) => void;
  // Add prop to enable free cropping (no fixed aspect ratio)
  freeCrop?: boolean;
  fileName?: string;
}

export function ImageCropper({
  dialogOpen,
  setDialogOpen,
  selectedFile,
  setSelectedFile,
  title = "Image Cropper",
  onCropComplete,
  freeCrop = false, // Default to false to maintain existing behavior
  fileName = "avatar.png",
}: ImageCropperProps) {
  // Use null for free cropping, 1 for square cropping
  const aspect = freeCrop ? null : 1;

  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = React.useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>("");
  const [croppedImage, setCroppedImage] = React.useState<string>("");

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (aspect !== null) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      // For free cropping, initialize with a default crop
      const { width, height } = e.currentTarget;
      setCrop({
        unit: "%",
        x: 10,
        y: 10,
        width: 80,
        height: 80,
      });
    }
  }

  function onCropCompleteHandler(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedImageUrl);
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
      );
    }

    return canvas.toDataURL("image/png", 1.0);
  }

  async function onCrop() {
    try {
      setCroppedImage(croppedImageUrl);

      // Convert data URL to File object and call onCropComplete callback
      if (onCropComplete && croppedImageUrl) {
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: "image/png" });
        onCropComplete(file);
      }

      setDialogOpen(false);
    } catch (error) {
      alert("Something went wrong!");
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        {freeCrop ? (
          <div className="h-36 w-auto cursor-pointer ring-offset-2 ring-2 ring-slate-200 overflow-hidden">
            <img
              src={croppedImage ? croppedImage : selectedFile?.preview}
              alt=""
              className="h-full w-auto object-contain"
            />
          </div>
        ) : (
          <Avatar className="size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200">
            <AvatarImage src={croppedImage ? croppedImage : selectedFile?.preview} alt="" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )}
      </DialogTrigger>
      <DialogContent
        className="p-0 gap-0 sm:max-w-lg"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <div className="p-6 size-full">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => onCropCompleteHandler(c)}
            // Only set aspect if not free cropping
            {...(aspect !== null ? { aspect } : {})}
            className="w-full"
          >
            <Avatar className="size-full rounded-none">
              <AvatarImage
                ref={imgRef}
                className="size-full rounded-none h-full w-full object-cover aspect-auto"
                alt="Image Cropper Shell"
                src={selectedFile?.preview}
                onLoad={onImageLoad}
              />
              <AvatarFallback className="size-full min-h-[460px] rounded-none">
                Loading...
              </AvatarFallback>
            </Avatar>
          </ReactCrop>
        </div>
        <DialogFooter className="p-6 pt-0 justify-center ">
          <DialogClose asChild>
            <Button
              size={"sm"}
              type="reset"
              className="w-fit"
              variant={"outline"}
              onClick={() => {
                setSelectedFile(null);
              }}
            >
              <Trash2Icon className="mr-1.5 size-4" />
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" size={"sm"} className="w-fit" onClick={onCrop}>
            <CropIcon className="mr-1.5 size-4" />
            Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to center the crop
export function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 50,
        height: 50,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}
