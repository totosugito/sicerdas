import { getStorageService } from "./fileStorageService";

export interface ExportLogEntry {
  sourceFile: string;
  exportedAt: string;
  questionCount: number;
  status: "success" | "error";
}

export interface ExportLog {
  exports: ExportLogEntry[];
}

const LOG_FILENAME = "export-log.json";

function getLogPath(topicDir: string): string {
  return `${topicDir.replace(/\/$/, "")}/${LOG_FILENAME}`;
}

function getRelativePath(topicDir: string, filePath: string): string {
  const normalizedTopic = topicDir.replace(/\/$/, "");
  const normalizedFile = filePath.replace(/\/$/, "");
  if (normalizedFile.startsWith(normalizedTopic + "/")) {
    return normalizedFile.slice(normalizedTopic.length + 1);
  }
  return normalizedFile;
}

export async function readExportLog(topicDir: string): Promise<ExportLog> {
  const storage = getStorageService();
  const logPath = getLogPath(topicDir);
  try {
    const content = await storage.readJsonFile(logPath);
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.exports)) {
      return parsed as ExportLog;
    }
    return { exports: [] };
  } catch {
    return { exports: [] };
  }
}

export async function appendExportLog(
  topicDir: string,
  entry: Omit<ExportLogEntry, "exportedAt">,
): Promise<void> {
  const storage = getStorageService();
  const log = await readExportLog(topicDir);
  log.exports.push({
    ...entry,
    exportedAt: new Date().toISOString(),
  });
  const logPath = getLogPath(topicDir);
  await storage.writeJsonFile(logPath, JSON.stringify(log, null, 2));
}

export async function getExportedFiles(topicDir: string): Promise<Set<string>> {
  const log = await readExportLog(topicDir);
  const exported = new Set<string>();
  for (const entry of log.exports) {
    if (entry.status === "success") {
      exported.add(entry.sourceFile);
    }
  }
  return exported;
}

export async function isFileExported(topicDir: string, filePath: string): Promise<boolean> {
  const relativePath = getRelativePath(topicDir, filePath);
  const exported = await getExportedFiles(topicDir);
  return exported.has(relativePath);
}
