import React from "react";
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import { IoMdClose, IoMdCreate } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const MathBlock = createReactBlockSpec(
  {
    type: "math",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      equation: {
        default: "",
      },
      fontSize: {
        default: 18,
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { block, editor } = props;

      const isSelected = editor.getTextCursorPosition()?.block?.id === block.id;
      const [isEditing, setIsEditing] = React.useState(false);

      React.useEffect(() => {
        if (!isSelected) {
          setIsEditing(false);
        }
      }, [isSelected]);

      const isShowingEditor = isSelected && isEditing;

      return (
        <div
          className={`relative group p-0 my-0.5 rounded-md transition-all border ${
            isShowingEditor
              ? "border-primary/30 bg-muted/50 shadow-sm"
              : "border-transparent hover:bg-muted/5"
          }`}
        >
          {/* Hover Edit Button */}
          {!isShowingEditor && editor.isEditable && (
            <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 gap-1.5 bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-primary hover:text-primary-foreground text-[10px] px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  // Ensure the block is selected when clicking edit
                  editor.setTextCursorPosition(block, "start");
                  editor.focus();
                }}
              >
                <IoMdCreate className="h-3 w-3" />
                <span>Edit</span>
              </Button>
            </div>
          )}

          {isShowingEditor && (
            <div className="flex flex-col p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-row justify-between items-center border-b pb-2 gap-8">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  KaTeX Editor
                </span>

                <div className="flex flex-row gap-4">
                  <Select
                    value={(block.props.fontSize ?? 18).toString()}
                    onValueChange={(val) => {
                      editor.updateBlock(block, {
                        type: "math",
                        props: { ...block.props, fontSize: parseInt(val) },
                      });
                    }}
                  >
                    <SelectTrigger className="w-[90px] h-7 text-[10px] bg-card" size="sm">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14" className="text-[10px]">
                        Small
                      </SelectItem>
                      <SelectItem value="18" className="text-[10px]">
                        Normal
                      </SelectItem>
                      <SelectItem value="24" className="text-[10px]">
                        Medium
                      </SelectItem>
                      <SelectItem value="32" className="text-[10px]">
                        Large
                      </SelectItem>
                      <SelectItem value="48" className="text-[10px]">
                        Extra Large
                      </SelectItem>
                      <SelectItem value="64" className="text-[10px]">
                        Huge
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(false);
                      editor.focus();
                    }}
                    title="Close Editor"
                  >
                    <IoMdClose className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={block.props.equation}
                onChange={(e) => {
                  editor.updateBlock(block, {
                    type: "math",
                    props: { ...block.props, equation: e.target.value },
                  });
                }}
                onKeyDown={(e) => {
                  // Prevent blocknote from swallowing important keystrokes
                  e.stopPropagation();
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    setIsEditing(false);
                    editor.focus();
                  }
                }}
                placeholder="Type your KaTeX equation here... (Ctrl+Enter to finish)"
                className="font-mono text-sm min-h-[80px] resize-y bg-card border-none focus-visible:ring-0 p-0"
                autoFocus
              />
            </div>
          )}

          <div
            className={`block text-center overflow-x-auto overflow-y-hidden transition-all scrollbar-hide ${
              isShowingEditor ? "px-4 py-4 border-t bg-background/50" : "px-0 py-1"
            }`}
            style={{ fontSize: `${block.props.fontSize ?? 18}px` }}
            onDoubleClick={() => {
              if (!isShowingEditor && editor.isEditable) {
                setIsEditing(true);
                editor.setTextCursorPosition(block, "start");
                editor.focus();
              }
            }}
          >
            <style>
              {`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none !important;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none !important;
                  scrollbar-width: none !important;
                }
                .katex-display {
                  margin: 0 !important;
                }
              `}
            </style>
            <BlockMath
              math={block.props.equation || "\\text{Click edit to add equation}"}
              renderError={(error) => (
                <span className="text-destructive font-mono text-sm">
                  {error.name}: {error.message}
                </span>
              )}
            />
          </div>
        </div>
      );
    },
  },
);
