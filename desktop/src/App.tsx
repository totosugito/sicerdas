import React, { useState, useEffect } from "react";
import { FileExplorerSidebar } from "./components/FileExplorerSidebar";
import { Toolbar } from "./components/Toolbar";
import { getStorageService, FileNode } from "./services/fileStorageService";
import { JsonQuestionsEditorContainer } from "@/features/exam/questions/json-questions";
import { FileText } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

const storageService = getStorageService();

const LAST_PATH_KEY = "sicerdas-desktop:lastPath";

export function App() {
  const [currentFolderPath, setCurrentFolderPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Resolve user's home directory on mount, restore last path if available
  useEffect(() => {
    storageService.getHomeDir().then((home) => {
      const saved = localStorage.getItem(LAST_PATH_KEY);
      const initial = saved || home;
      setCurrentFolderPath(initial);
      setHistoryStack([initial]);
    });
  }, []);

  // Persist current path to localStorage
  useEffect(() => {
    if (currentFolderPath) {
      localStorage.setItem(LAST_PATH_KEY, currentFolderPath);
    }
  }, [currentFolderPath]);

  const pushHistory = (path: string) => {
    setHistoryStack((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      if (trimmed[trimmed.length - 1] === path) return trimmed;
      return [...trimmed, path];
    });
    setHistoryIndex((prev) => prev + 1);
  };

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
    pushHistory(folderPath);
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
    pushHistory(parentPath);
  };

  const handleGoHome = async () => {
    const home = await storageService.getHomeDir();
    setCurrentFolderPath(home);
    pushHistory(home);
  };

  const handleNavigateToPath = (path: string) => {
    setSelectedFilePath(null);
    setCurrentFolderPath(path);
    pushHistory(path);
  };

  const handleBack = () => {
    const prevIndex = historyIndex - 1;
    if (prevIndex < 0) return;
    setHistoryIndex(prevIndex);
    setSelectedFilePath(null);
    setCurrentFolderPath(historyStack[prevIndex]);
  };

  const handleForward = () => {
    const nextIndex = historyIndex + 1;
    if (nextIndex >= historyStack.length) return;
    setHistoryIndex(nextIndex);
    setSelectedFilePath(null);
    setCurrentFolderPath(historyStack[nextIndex]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      {/* 🌟 ULTRA-CLEAN FULL-WIDTH TOP TOOLBAR */}
      <Toolbar
        currentFolderPath={currentFolderPath}
        selectedFileName={selectedFilePath ? selectedFilePath.split("/").pop() ?? null : null}
        isDirty={isDirty}
        saveStatus={saveStatus}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < historyStack.length - 1}
        onBack={handleBack}
        onForward={handleForward}
        onOpenFolder={handleOpenFolder}
        onNavigateUp={handleNavigateUp}
        onRefresh={handleRefreshFolder}
        onGoHome={handleGoHome}
        onNavigateToPath={handleNavigateToPath}
        onSave={handleSaveFile}
      />

      {/* Main App Workspace Layout */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden">
        {/* Left Side Explorer Tree */}
        <FileExplorerSidebar
          fileTree={fileTree}
          selectedFilePath={selectedFilePath}
          onSelectFile={handleSelectFile}
          onNavigateFolder={handleNavigateToPath}
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
                Sicerdas Question Studio
              </h2>
              <p className="max-w-md text-sm mb-6">
                Select a JSON question file from the Explorer sidebar on the left, or use the top address bar to open a different directory.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
