import React, { useState } from "react";
import {
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Minimize2,
  Maximize2,
  FileText,
  FileImage,
} from "lucide-react";
import { VscJson, VscMarkdown } from "react-icons/vsc";
import { ImFilePdf } from "react-icons/im";
import { TbSvg } from "react-icons/tb";
import { FileNode } from "../services/fileStorageService";
import { Button } from "@/components/ui/button";

interface FileExplorerSidebarProps {
  fileTree: FileNode[];
  selectedFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  onNavigateFolder: (dirPath: string) => void;
  isDirty?: boolean;
}

export function FileExplorerSidebar({
  fileTree,
  selectedFilePath,
  onSelectFile,
  onNavigateFolder,
  isDirty,
}: FileExplorerSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const collapseAll = () => {
    setExpandedFolders({});
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    const collect = (nodes: FileNode[]) => {
      nodes.forEach((n) => {
        if (n.isDirectory) {
          all[n.path] = true;
          if (n.children) collect(n.children);
        }
      });
    };
    collect(fileTree);
    setExpandedFolders(all);
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return (
      <ul className="flex flex-col gap-0.5 select-none text-xs">
        {nodes.map((node) => {
          const isSelected = selectedFilePath === node.path;
          const isExpanded = expandedFolders[node.path];

          if (node.isDirectory) {
            return (
              <li key={node.path} className="flex flex-col">
                <div
                  className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent/60 rounded cursor-pointer text-muted-foreground font-medium transition-colors"
                  style={{ paddingLeft: `${level * 12 + 8}px` }}
                >
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(node.path);
                    }}
                    className="flex items-center shrink-0"
                  >
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </span>
                  <div
                    onClick={() => {
                      toggleFolder(node.path);
                      onNavigateFolder(node.path);
                    }}
                    className="flex items-center gap-1.5 min-w-0 flex-1"
                  >
                    <Folder className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
                    <span className="truncate">{node.name}</span>
                  </div>
                </div>
                {isExpanded && node.children && renderTree(node.children, level + 1)}
              </li>
            );
          }

          const isJson = node.name.endsWith(".json");
          const isPdf = node.name.endsWith(".pdf");
          const isMd = node.name.endsWith(".md");
          const isImage = /\.(png|jpe?g|gif|webp|bmp|ico)$/i.test(node.name);
          const isSvg = node.name.endsWith(".svg");

          return (
            <li key={node.path}>
              <div
                onClick={() => onSelectFile(node.path)}
                className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${isSelected
                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    : "hover:bg-accent/60 text-foreground"
                  }`}
                style={{ paddingLeft: `${level * 12 + 20}px` }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isMd ? (
                    <VscMarkdown className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : isJson ? (
                    <VscJson className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                  ) : isPdf ? (
                    <ImFilePdf className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  ) : isImage ? (
                    <FileImage className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                  ) : isSvg ? (
                    <TbSvg className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
                  <span className="truncate">{node.name}</span>
                </div>
                {isSelected && isDirty && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" title="Unsaved changes" />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside className="w-80 h-full flex flex-col border-r bg-card/40 backdrop-blur-sm shrink-0">
      {/* Sidebar Sub-Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
        <span>Files & Folders</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={expandAll}
            title="Expand All Folders"
            className="h-5 w-5"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={collapseAll}
            title="Collapse All Folders"
            className="h-5 w-5"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Directory Tree View */}
      <div className="flex-1 overflow-y-auto p-2">
        {fileTree.length > 0 ? (
          renderTree(fileTree)
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-xs text-muted-foreground">
            <FolderOpen className="h-8 w-8 mb-2 opacity-40 stroke-1" />
            <p className="font-medium mb-1">No Files Found</p>
            <p className="text-[11px]">Use the top toolbar to open an OS directory.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
