import { Code, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvalidFileSelectedProps {
  filePath?: string | null;
  message?: string;
  onViewRawJson?: () => void;
}

export function InvalidFileSelected({
  filePath,
  message = "The selected file is not a valid JSON or Markdown file.",
  onViewRawJson,
}: InvalidFileSelectedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-6">
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <FileWarning className="h-10 w-10 text-destructive opacity-80" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Invalid File</h2>
      <div className="max-w-xl w-full rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-xs font-mono text-destructive break-words mb-3">
        {message}
      </div>
      {filePath && (
        <code className="max-w-xl text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded break-all mb-4">
          {filePath}
        </code>
      )}
      {onViewRawJson && (
        <Button size="sm" variant="outline" onClick={onViewRawJson} className="gap-1.5">
          <Code className="h-3.5 w-3.5" />
          View Raw JSON
        </Button>
      )}
    </div>
  );
}
