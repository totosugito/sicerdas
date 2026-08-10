import { FolderOpen } from "lucide-react";

export function NoFileSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
      <div className="p-4 rounded-full bg-primary/10 mb-4">
        <FolderOpen className="h-10 w-10 text-primary opacity-80" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Sicerdas Question Studio
      </h2>
      <p className="max-w-md text-sm mb-6">
        Select a JSON question file from the Explorer sidebar on the left, or use the top address bar to open a different directory.
      </p>
    </div>
  );
}
