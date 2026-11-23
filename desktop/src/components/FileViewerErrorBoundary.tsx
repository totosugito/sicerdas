import React from "react";
import { AlertTriangle, Code, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileViewerErrorBoundaryProps {
  children: React.ReactNode;
  filePath?: string | null;
  isJsonFile?: boolean;
  isMarkdownFile?: boolean;
  onViewRaw?: () => void;
}

interface FileViewerErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FileViewerErrorBoundary extends React.Component<
  FileViewerErrorBoundaryProps,
  FileViewerErrorBoundaryState
> {
  constructor(props: FileViewerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FileViewerErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: FileViewerErrorBoundaryProps) {
    if (prevProps.filePath !== this.props.filePath && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error details are displayed in the fallback UI; avoid noisy console stack traces.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { filePath, isJsonFile, isMarkdownFile, onViewRaw } = this.props;
    const message =
      this.state.error?.message || "An unexpected error occurred while rendering this file.";

    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="p-4 rounded-full bg-destructive/10 mb-4">
          <AlertTriangle className="h-10 w-10 text-destructive opacity-80" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Render File</h2>
        <p className="max-w-lg text-sm text-muted-foreground mb-3">
          {isJsonFile
            ? "This JSON file may use an older or incompatible schema format."
            : "An error occurred while displaying this file."}
        </p>
        <div className="max-w-xl w-full rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-xs font-mono text-destructive break-words mb-3">
          {message}
        </div>
        {filePath && (
          <code className="max-w-xl text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded break-all mb-5">
            {filePath}
          </code>
        )}
        <div className="flex items-center gap-2">
          {(isJsonFile || isMarkdownFile) && onViewRaw && (
            <Button size="sm" variant="outline" onClick={onViewRaw} className="gap-1.5">
              <Code className="h-3.5 w-3.5" />
              {isJsonFile ? "View Raw JSON" : "View Raw Markdown"}
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={this.handleRetry} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
}
