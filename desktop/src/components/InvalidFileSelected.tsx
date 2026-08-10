import { FileWarning } from "lucide-react";

interface InvalidFileSelectedProps {
  filePath?: string | null;
  message?: string;
}

export function InvalidFileSelected({
  filePath,
  message = "The selected file is not a valid JSON or Markdown file.",
}: InvalidFileSelectedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <FileWarning className="h-10 w-10 text-destructive opacity-80" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Invalid File
      </h2>
      <p className="max-w-md text-sm mb-2">{message}</p>
      {filePath && (
        <code className="max-w-md text-xs text-muted-foreground bg-muted px-2 py-1 rounded break-all">
          {filePath}
        </code>
      )}
    </div>
  );
}
