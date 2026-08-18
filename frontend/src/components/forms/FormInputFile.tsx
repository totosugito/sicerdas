import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFileUpload, formatBytes, type FileWithPreview } from "@/hooks/use-file-upload";
import { Upload, X, File, Image } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormInputFileProps = {
  field: any; // TanStack Form Field instance
  item: {
    name: string;
    label: string;
    placeholder?: string;
    description?: string;
    maxFiles?: number;
    maxSize?: number;
    totalMaxSize?: number;
    accept?: string;
    multiple?: boolean;
    compact?: boolean;
    required?: boolean;
  };
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  showMessage?: boolean;
};

export const FormInputFile = ({
  field,
  item,
  showMessage = true,
  className,
  labelClassName = "",
  ...props
}: FormInputFileProps) => {
  // Extract parameters from item with defaults
  const maxFiles = item.maxFiles ?? 5;
  const maxSize = item.maxSize ?? 5 * 1024 * 1024; // 10MB per file
  const totalMaxSize = item.totalMaxSize ?? 5 * 1024 * 1024; // 50MB total
  const accept = item.accept ?? "*";
  const multiple = item.multiple ?? true;
  const compact = item.compact ?? false;

  // Watch field value
  const formValue = field.state.value;

  const [state, actions] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: formValue,
    onFilesChange: (files: FileWithPreview[]) => {
      requestAnimationFrame(() => {
        const fileObjects = files.map((f) => f.file);
        field.handleChange(multiple ? fileObjects : fileObjects[0] || null);
      });
    },
  });

  // Sync hook state when form value changes externally
  useEffect(() => {
    if (formValue && Array.isArray(formValue) && formValue.length > 0) {
      if (state.files.length === 0) {
        actions.setFilesFromFormValue(formValue);
      }
    } else if (!formValue && state.files.length > 0) {
      actions.clearFiles();
    }
  }, [formValue, state.files.length, actions]);

  // Sync on component mount if form already has files
  useEffect(() => {
    if (formValue && Array.isArray(formValue) && formValue.length > 0 && state.files.length === 0) {
      actions.setFilesFromFormValue(formValue);
    }
  }, []);

  // Calculate total size of all files
  const totalSize = state.files.reduce((acc, fileWithPreview) => {
    return acc + fileWithPreview.file.size;
  }, 0);

  // Check if total size exceeds limit
  const exceedsTotalSize = totalSize > totalMaxSize;

  // Handle total size validation
  useEffect(() => {
    const validateTotalSize = () => {
      if (exceedsTotalSize) {
        const errorMessage = `Total file size (${formatBytes(totalSize)}) exceeds maximum allowed size (${formatBytes(totalMaxSize)})`;
        field.setError(errorMessage);
      } else {
        field.setError(undefined);
      }
    };
    const timeoutId = requestAnimationFrame(validateTotalSize);
    return () => {
      cancelAnimationFrame(timeoutId);
    };
  }, [exceedsTotalSize, totalSize, totalMaxSize, field]);

  const renderFilePreview = (fileWithPreview: FileWithPreview) => {
    const file = fileWithPreview.file;
    const isImage = file.type.startsWith("image/");

    return (
      <Card key={fileWithPreview.id} className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {isImage ? (
                <div className="relative">
                  <Image className="w-8 h-8 text-blue-500" />
                  {fileWithPreview.preview && (
                    <img
                      src={fileWithPreview.preview}
                      alt={file.name}
                      className="absolute inset-0 w-8 h-8 object-cover rounded"
                    />
                  )}
                </div>
              ) : (
                <File className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => actions.removeFile(fileWithPreview.id)}
            className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div data-slot="form-item" className="grid gap-2">
      <field.Label className={cn("", labelClassName)}>
        {item.label}
        {item.required && <span className="text-red-500">*</span>}
      </field.Label>
      <field.Control>
        {compact ? (
          <div className="space-y-2 w-full overflow-hidden">
            <div
              className={cn("relative", state.isDragging && "ring-2 ring-primary ring-offset-2")}
              onDragEnter={actions.handleDragEnter}
              onDragLeave={actions.handleDragLeave}
              onDragOver={actions.handleDragOver}
              onDrop={actions.handleDrop}
            >
              <input
                {...actions.getInputProps()}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  state.isDragging && "border-primary bg-primary/5",
                  exceedsTotalSize && "border-red-500",
                  className,
                )}
                placeholder={item.placeholder || "Choose files or drag and drop"}
              />
              {state.isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-md border-2 border-dashed border-primary">
                  <p className="text-sm text-primary font-medium">Drop files here</p>
                </div>
              )}
            </div>

            {state.files.length > 0 && (
              <div className="text-xs text-muted-foreground space-y-2 w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <span>
                    {state.files.length} file{state.files.length > 1 ? "s" : ""} selected
                    {multiple && ` (max ${maxFiles})`}
                  </span>
                  <span>Total: {formatBytes(totalSize)}</span>
                </div>

                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {state.files.map((fileWithPreview) => {
                    const file = fileWithPreview.file;
                    const isImage = file.type.startsWith("image/");
                    return (
                      <div
                        key={fileWithPreview.id}
                        className="flex items-center gap-2 p-2 bg-muted/30 rounded border min-w-0"
                      >
                        <div className="flex-shrink-0">
                          {isImage ? (
                            <Image className="w-3 h-3 text-blue-500" />
                          ) : (
                            <File className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                          <span className="truncate text-xs font-medium min-w-0" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => actions.removeFile(fileWithPreview.id)}
                          className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {state.files.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={actions.clearFiles}
                    className="h-6 px-2 text-xs hover:bg-red-100 hover:text-red-600 w-full"
                  >
                    Clear All Files
                  </Button>
                )}
              </div>
            )}

            {state.errors.length > 0 && (
              <div className="text-xs text-red-600 space-y-1">
                {state.errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                state.isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50",
                exceedsTotalSize && "border-red-500 bg-red-50",
              )}
              onDragEnter={actions.handleDragEnter}
              onDragLeave={actions.handleDragLeave}
              onDragOver={actions.handleDragOver}
              onDrop={actions.handleDrop}
              onClick={actions.openFileDialog}
            >
              <input {...actions.getInputProps()} className="hidden" />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                {state.isDragging
                  ? "Drop files here"
                  : "Click to browse or drag and drop files here"}
              </p>
              <p className="text-xs text-muted-foreground">
                {multiple ? `Max ${maxFiles} files` : "Single file only"} • Max {formatBytes(maxSize)}{" "}
                per file • Total max {formatBytes(totalMaxSize)}
              </p>
              {accept !== "*" && (
                <p className="text-xs text-muted-foreground mt-1">Accepted: {accept}</p>
              )}
            </div>

            {state.files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Files ({state.files.length}
                    {multiple ? `/${maxFiles}` : ""})
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Total: {formatBytes(totalSize)} / {formatBytes(totalMaxSize)}
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {state.files.map(renderFilePreview)}
                </div>
                {state.files.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={actions.clearFiles}
                    className="w-full"
                  >
                    Clear All Files
                  </Button>
                )}
              </div>
            )}

            {state.errors.length > 0 && (
              <div className="space-y-1">
                {state.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </field.Control>
      {item.description && <field.Description>{item.description}</field.Description>}
      {showMessage && <field.Message />}
    </div>
  );
};
