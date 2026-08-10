import React, { useState, useEffect } from "react";
import { FileExplorerSidebar } from "./components/FileExplorerSidebar";
import { Toolbar } from "./components/Toolbar";
import { getStorageService, FileNode } from "./services/fileStorageService";
import { DesktopJsonQuestionsEditorContainer } from "./components/DesktopJsonQuestionsEditorContainer";
import { MarkdownViewer } from "./components/MarkdownViewer";
import { ImageViewer } from "./components/ImageViewer";
import { NoFileSelected } from "./components/NoFileSelected";
import { InvalidFileSelected } from "./components/InvalidFileSelected";
import { useAppStore } from "@/stores/useAppStore";
import { getExportedFiles } from "./services/exportLogService";

const storageService = getStorageService();

const LAST_PATH_KEY = "sicerdas-desktop:lastPath";
const RAW_MD_KEY = "sicerdas-desktop:showRawMarkdown";
const RAW_JSON_KEY = "sicerdas-desktop:showRawJson";

export function App() {
  const [currentFolderPath, setCurrentFolderPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [rawFileContent, setRawFileContent] = useState<string | null>(null);
  const [isMarkdownFile, setIsMarkdownFile] = useState(false);
  const [isJsonFile, setIsJsonFile] = useState(false);
  const [isImageFile, setIsImageFile] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [showRawMarkdown, setShowRawMarkdown] = useState(() => {
    return localStorage.getItem(RAW_MD_KEY) === "true";
  });
  const [showRawJson, setShowRawJson] = useState(() => {
    return localStorage.getItem(RAW_JSON_KEY) === "true";
  });
  const [invalidFile, setInvalidFile] = useState<{ path: string; message: string } | null>(null);

  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [exportedFiles, setExportedFiles] = useState<Set<string>>(new Set());

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

  // Persist raw view toggles to localStorage
  useEffect(() => {
    localStorage.setItem(RAW_MD_KEY, String(showRawMarkdown));
  }, [showRawMarkdown]);

  useEffect(() => {
    localStorage.setItem(RAW_JSON_KEY, String(showRawJson));
  }, [showRawJson]);

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
      refreshExportedFiles();
    }
  }, [currentFolderPath]);

  const refreshExportedFiles = async () => {
    if (currentFolderPath) {
      const files = await getExportedFiles(currentFolderPath);
      setExportedFiles(files);
    }
  };

  const jsonQuestions = useAppStore((state) => state.jsonQuestions);
  const setJsonQuestions = useAppStore((state) => state.setJsonQuestions);
  const setCurrentJsonFilePath = useAppStore((state) => state.setCurrentJsonFilePath);

  const handleOpenFolder = async () => {
    const folderPath = await storageService.selectDirectory();
    if (!folderPath) return;

    setCurrentFolderPath(folderPath);
    pushHistory(folderPath);
    const tree = await storageService.readDirectoryTree(folderPath);
    setFileTree(tree);
  };

  const handleSelectFile = async (filePath: string) => {
    setInvalidFile(null);
    const isMd = filePath.endsWith(".md");
    const isJson = filePath.endsWith(".json");
    const isImage = /\.(png|jpe?g|svg|gif|webp|bmp|ico)$/i.test(filePath);

    if (!isMd && !isJson && !isImage) {
      setSelectedFilePath(filePath);
      setIsMarkdownFile(false);
      setIsJsonFile(false);
      setIsImageFile(false);
      setInvalidFile({
        path: filePath,
        message: "Unsupported file type. Only .md, .json, and image files are supported.",
      });
      return;
    }

    try {
      if (isImage) {
        const dataUrl = await storageService.readImageFile(filePath);
        setImageDataUrl(dataUrl);
        setIsImageFile(true);
        setIsMarkdownFile(false);
        setIsJsonFile(false);
        setSelectedFilePath(filePath);
        setRawFileContent(null);
        setIsDirty(false);
        setCurrentJsonFilePath(null);
        setSaveStatus("Loaded");
        setTimeout(() => setSaveStatus(null), 2000);
        return;
      }

      const content = await storageService.readJsonFile(filePath);
      setRawFileContent(content);
      setImageDataUrl(null);
      setIsImageFile(false);
      if (isMd) {
        setIsMarkdownFile(true);
        setIsJsonFile(false);
        setCurrentJsonFilePath(null);
      } else {
        setIsMarkdownFile(false);
        setIsJsonFile(true);
        const parsed = JSON.parse(content);
        setJsonQuestions(Array.isArray(parsed) ? parsed : [parsed]);
        setCurrentJsonFilePath(filePath);
      }
      setSelectedFilePath(filePath);
      setIsDirty(false);
      setSaveStatus("Loaded");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Error loading file:", err);
      setSelectedFilePath(filePath);
      setIsMarkdownFile(false);
      setIsJsonFile(false);
      setIsImageFile(false);
      setImageDataUrl(null);
      setInvalidFile({
        path: filePath,
        message: err instanceof Error ? err.message : "Could not read or parse this file.",
      });
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
    setRawFileContent(null);
    setCurrentFolderPath(path);
    pushHistory(path);
  };

  const handleBack = () => {
    const prevIndex = historyIndex - 1;
    if (prevIndex < 0) return;
    setHistoryIndex(prevIndex);
    setSelectedFilePath(null);
    setRawFileContent(null);
    setCurrentFolderPath(historyStack[prevIndex]);
  };

  const handleForward = () => {
    const nextIndex = historyIndex + 1;
    if (nextIndex >= historyStack.length) return;
    setHistoryIndex(nextIndex);
    setSelectedFilePath(null);
    setRawFileContent(null);
    setCurrentFolderPath(historyStack[nextIndex]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      <Toolbar
        currentFolderPath={currentFolderPath}
        isDirty={isDirty}
        saveStatus={saveStatus}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < historyStack.length - 1}
        showRawMarkdown={showRawMarkdown}
        showRawJson={showRawJson}
        onBack={handleBack}
        onForward={handleForward}
        onOpenFolder={handleOpenFolder}
        onNavigateUp={handleNavigateUp}
        onRefresh={handleRefreshFolder}
        onGoHome={handleGoHome}
        onNavigateToPath={handleNavigateToPath}
        onSave={handleSaveFile}
        onToggleRawMarkdown={() => setShowRawMarkdown((v) => !v)}
        onToggleRawJson={() => setShowRawJson((v) => !v)}
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
          exportedFiles={exportedFiles}
          topicDir={currentFolderPath}
        />

        {/* Right Side Main Editor Container */}
        <main className="flex-1 h-full min-w-0 overflow-y-auto p-6">
          {selectedFilePath && isMarkdownFile && showRawMarkdown && rawFileContent ? (
            <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground">
              {rawFileContent}
            </pre>
          ) : selectedFilePath && isJsonFile && showRawJson && rawFileContent ? (
            <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground">
              {rawFileContent}
            </pre>
          ) : selectedFilePath && isMarkdownFile && rawFileContent ? (
            <MarkdownViewer content={rawFileContent} filePath={selectedFilePath} />
          ) : selectedFilePath && isJsonFile ? (
            <DesktopJsonQuestionsEditorContainer onExportSuccess={refreshExportedFiles} />
          ) : selectedFilePath && isImageFile && imageDataUrl ? (
            <ImageViewer src={imageDataUrl} alt={selectedFilePath} />
          ) : selectedFilePath && invalidFile ? (
            <InvalidFileSelected filePath={invalidFile.path} message={invalidFile.message} />
          ) : (
            <NoFileSelected />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
