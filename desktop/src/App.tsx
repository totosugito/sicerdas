import React, { useState, useEffect } from "react";
import { FileExplorerSidebar } from "./components/FileExplorerSidebar";
import { Toolbar } from "./components/Toolbar";
import { getStorageService, FileNode } from "./services/fileStorageService";
import { DesktopJsonQuestionsEditorContainer } from "./components/DesktopJsonQuestionsEditorContainer";
import { MarkdownViewer } from "./components/MarkdownViewer";
import { ImageViewer } from "./components/ImageViewer";
import { NoFileSelected } from "./components/NoFileSelected";
import { InvalidFileSelected } from "./components/InvalidFileSelected";
import { FileViewerErrorBoundary } from "./components/FileViewerErrorBoundary";
import { useAppStore } from "@/stores/useAppStore";
import { getExportedFiles } from "./services/exportLogService";
import { BlockNoteEditor } from "@blocknote/core";
import { schema as blockNoteSchema } from "@/components/custom/blocknote/lib/blocknote-config";
import { validateAndRepairBlockNoteContent } from "@/features/exam/questions/json-questions/utils/validate-blocknote-content";

const validateBlockNoteArray = (blocks: unknown): string | null => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  try {
    const cloned = JSON.parse(JSON.stringify(blocks));
    validateAndRepairBlockNoteContent(cloned);
    BlockNoteEditor.create({ schema: blockNoteSchema, initialContent: cloned });
    return null;
  } catch (err: any) {
    const causeMsg = err?.cause instanceof Error ? err.cause.message : null;
    const msg = err instanceof Error ? err.message : "Invalid BlockNote content";
    return causeMsg ? `${msg} (${causeMsg})` : msg;
  }
};

const validateQuestionsForEditor = (questions: any[]): string | null => {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q || typeof q !== "object") {
      return `Question #${i + 1} is not a valid object.`;
    }
    const contentErr = validateBlockNoteArray(q.content);
    if (contentErr) return `Question #${i + 1} content: ${contentErr}`;

    const reasonErr = validateBlockNoteArray(q.reasonContent);
    if (reasonErr) return `Question #${i + 1} reasonContent: ${reasonErr}`;

    if (Array.isArray(q.options)) {
      for (let j = 0; j < q.options.length; j++) {
        const optErr = validateBlockNoteArray(q.options[j]?.content);
        if (optErr) return `Question #${i + 1} option #${j + 1}: ${optErr}`;
      }
    }

    if (Array.isArray(q.solutions)) {
      for (let j = 0; j < q.solutions.length; j++) {
        const solErr = validateBlockNoteArray(q.solutions[j]?.content);
        if (solErr) return `Question #${i + 1} solution #${j + 1}: ${solErr}`;
      }
    }
  }
  return null;
};

const storageService = getStorageService();

const LAST_PATH_KEY = "sicerdas-desktop:lastPath";
const RAW_MD_KEY = "sicerdas-desktop:showRawMarkdown";
const RAW_JSON_KEY = "sicerdas-desktop:showRawJson";

const resolvePath = (baseDir: string, relative: string) => {
  const parts = baseDir.split("/");
  const relParts = relative.split("/");
  for (const p of relParts) {
    if (p === "..") parts.pop();
    else if (p !== ".") parts.push(p);
  }
  return parts.join("/");
};

const resolveImagesForView = async (data: any, filePath: string): Promise<any> => {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => resolveImagesForView(item, filePath)));
  }

  const newData = { ...data };

  for (const key of Object.keys(newData)) {
    const val = newData[key];
    if (
      typeof val === "string" &&
      (val.startsWith("../") || val.startsWith("./")) &&
      /\.(png|jpe?g|svg|gif|webp)$/i.test(val)
    ) {
      try {
        const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
        const absolutePath = resolvePath(dirPath, val);
        const base64 = await storageService.readImageFile(absolutePath);
        newData[key] = base64;
        newData[`_original_${key}`] = val;
      } catch (e) {
        console.error("[DEBUG] Failed to resolve string image path:", e);
      }
    } else if (typeof val === "object") {
      newData[key] = await resolveImagesForView(val, filePath);
    }
  }
  return newData;
};

const revertImagesForSave = (data: any): any => {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map((item) => revertImagesForSave(item));
  }

  const newData = { ...data };

  for (const key of Object.keys(newData)) {
    if (key.startsWith("_original_") && typeof newData[key] === "string") {
      const originalKey = key.substring("_original_".length);
      newData[originalKey] = newData[key];
      delete newData[key];
    } else if (typeof newData[key] === "object") {
      newData[key] = revertImagesForSave(newData[key]);
    }
  }
  return newData;
};

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
  const [invalidFile, setInvalidFile] = useState<{
    path: string;
    message: string;
    canViewRawJson?: boolean;
  } | null>(null);

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
        const parsed = JSON.parse(content);
        const resolved = await resolveImagesForView(parsed, filePath);
        const rawQuestions = Array.isArray(resolved) ? resolved : [resolved];
        const questions = rawQuestions.map((q: any, index: number) => ({
          ...q,
          id: q.id || `temp-${index}`,
          options: (q.options || []).map((opt: any, optIndex: number) => ({
            ...opt,
            id: opt.id || `temp-opt-${index}-${optIndex}`,
          })),
          solutions: (q.solutions || []).map((sol: any, solIndex: number) => ({
            ...sol,
            id: sol.id || `temp-sol-${index}-${solIndex}`,
          })),
        }));
        const validationError = validateQuestionsForEditor(questions);
        if (validationError) {
          setIsJsonFile(false);
          setCurrentJsonFilePath(null);
          setSelectedFilePath(filePath);
          setIsDirty(false);
          setInvalidFile({
            path: filePath,
            message: validationError,
            canViewRawJson: true,
          });
          return;
        }
        setIsJsonFile(true);
        setJsonQuestions(questions);
        setCurrentJsonFilePath(filePath);
      }
      setSelectedFilePath(filePath);
      setIsDirty(false);
      setSaveStatus("Loaded");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
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
      const reverted = revertImagesForSave(jsonQuestions);
      await storageService.writeJsonFile(selectedFilePath, JSON.stringify(reverted, null, 2));
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
    const parentPath =
      currentFolderPath.replace(/\/+$/, "").split("/").slice(0, -1).join("/") || "/";
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
          <FileViewerErrorBoundary
            key={`${selectedFilePath ?? ""}:${showRawJson}:${showRawMarkdown}`}
            filePath={selectedFilePath}
            isJsonFile={isJsonFile}
            isMarkdownFile={isMarkdownFile}
            onViewRaw={() => {
              if (isJsonFile) setShowRawJson(true);
              else if (isMarkdownFile) setShowRawMarkdown(true);
            }}
          >
            {selectedFilePath && isMarkdownFile && showRawMarkdown && rawFileContent ? (
              <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground">
                {rawFileContent}
              </pre>
            ) : selectedFilePath &&
              (isJsonFile || invalidFile?.canViewRawJson) &&
              showRawJson &&
              rawFileContent ? (
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
              <InvalidFileSelected
                filePath={invalidFile.path}
                message={invalidFile.message}
                onViewRawJson={invalidFile.canViewRawJson ? () => setShowRawJson(true) : undefined}
              />
            ) : (
              <NoFileSelected />
            )}
          </FileViewerErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;
