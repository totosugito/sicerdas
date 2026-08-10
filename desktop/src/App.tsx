import React, { useState, useEffect } from "react";
import { FileExplorerSidebar } from "./components/FileExplorerSidebar";
import { getStorageService, DEFAULT_OS_PATH, FileNode } from "./services/fileStorageService";
import { JsonQuestionsEditorContainer } from "@/features/exam/questions/json-questions";
import {
  Save,
  CheckCircle2,
  FolderOpen,
  ArrowUp,
  RefreshCw,
  Folder,
  FileText,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";

const storageService = getStorageService();

export function App() {
  const [currentFolderPath, setCurrentFolderPath] = useState<string | null>(DEFAULT_OS_PATH);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (currentFolderPath) {
      storageService.readDirectoryTree(currentFolderPath).then((tree) => {
        setFileTree(tree);
      });
    }
  }, [currentFolderPath]);

  const jsonQuestions = useAppStore((state) => state.jsonQuestions);
  const setJsonQuestions = useAppStore((state) => state.setJsonQuestions);

  const handleOpenFolder = async () => {
    const folderPath = await storageService.selectDirectory();
    if (!folderPath) return;

    setCurrentFolderPath(folderPath);
    const tree = await storageService.readDirectoryTree(folderPath);
    setFileTree(tree);
  };

  const handleSelectFile = async (filePath: string) => {
    try {
      const content = await storageService.readJsonFile(filePath);
      const parsed = JSON.parse(content);
      setJsonQuestions(Array.isArray(parsed) ? parsed : [parsed]);
      setSelectedFilePath(filePath);
      setIsDirty(false);
      setSaveStatus("Loaded");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Error loading file:", err);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFilePath) return;
    try {
      await storageService.writeJsonFile(selectedFilePath, JSON.stringify(jsonQuestions, null, 2));
      setIsDirty(false);
      setSaveStatus("Saved to disk!");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error("Error saving file:", err);
    }
  };

  const handleRefreshFolder = async () => {
    if (!currentFolderPath) return;
    const tree = await storageService.readDirectoryTree(currentFolderPath);
    setFileTree(tree);
  };

  const handleNavigateUp = async () => {
    if (!currentFolderPath || currentFolderPath === "/") return;
    const parentPath = currentFolderPath.replace(/\/+$/, "").split("/").slice(0, -1).join("/") || "/";
    setCurrentFolderPath(parentPath);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      {/* 🌟 ULTRA-CLEAN FULL-WIDTH TOP TOOLBAR */}
      <header className="h-10 w-full border-b bg-card/60 backdrop-blur-md flex items-center justify-between px-3 shrink-0 gap-2">
        {/* Navigation & Directory Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleOpenFolder}
            title="Open Directory Folder"
            className="h-7 w-7"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleNavigateUp}
            title="Up to Parent Directory"
            disabled={!currentFolderPath || currentFolderPath === "/"}
            className="h-7 w-7"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefreshFolder}
            title="Refresh Folder"
            className="h-7 w-7"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Center: Full-Width Address Bar */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            readOnly
            value={currentFolderPath || "No folder opened"}
            onClick={handleOpenFolder}
            className="w-full h-7 px-2.5 text-[11px] font-mono bg-muted/40 border rounded text-foreground truncate cursor-pointer hover:bg-muted/70 transition focus:outline-none focus:ring-1 focus:ring-primary"
            title="Click to open folder dialog"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {saveStatus && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium animate-fadeIn">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {saveStatus}
            </span>
          )}

          {selectedFilePath && (
            <Button
              onClick={handleSaveFile}
              variant="success"
              size="icon-sm"
              className="h-7 w-7 shadow-xs"
              title="Save file (Ctrl+S)"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main App Workspace Layout */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden">
        {/* Left Side Explorer Tree */}
        <FileExplorerSidebar
          fileTree={fileTree}
          selectedFilePath={selectedFilePath}
          onSelectFile={handleSelectFile}
          isDirty={isDirty}
        />

        {/* Right Side Main Editor Container */}
        <main className="flex-1 h-full min-w-0 overflow-y-auto p-6">
          {selectedFilePath ? (
            <JsonQuestionsEditorContainer showBackTitle={false} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-10 w-10 text-primary opacity-80" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Sicerdas Desktop Question Studio
              </h2>
              <p className="max-w-md text-sm mb-6">
                Select a JSON question file from the Explorer sidebar on the left, or use the top address bar to open a different directory.
              </p>
              <Button onClick={handleOpenFolder} size="md" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>Open OS Question Folder</span>
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
