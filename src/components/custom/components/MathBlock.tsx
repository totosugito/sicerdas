import React from "react";
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const MathBlock = createReactBlockSpec(
  {
    type: "math",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      equation: {
        default: "",
      },
      size: {
        default: "1em",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { block, editor } = props;

      const isSelected = editor.getTextCursorPosition()?.block?.id === block.id;
      const [showEditor, setShowEditor] = React.useState(false);

      React.useEffect(() => {
        if (!isSelected) {
          setShowEditor(false);
        }
      }, [isSelected]);

      const isFocused = editor.isEditable && showEditor;

      return (
        <div
          onDoubleClick={() => editor.isEditable && setShowEditor(true)}
          className={`p-0 my-0 rounded-md transition-all [&_.katex-display]:!my-2 ${isFocused ? "ring-1 ring-primary/20 bg-muted/50" : editor.isEditable ? "hover:bg-muted/30 cursor-pointer" : ""}`}
        >
          {isFocused && (
            <div className="flex flex-col p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  KaTeX Editor
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={block.props.size}
                    onChange={(e) => {
                      editor.updateBlock(block, {
                        type: "math",
                        props: { ...block.props, size: e.target.value },
                      });
                    }}
                    className="text-xs bg-card border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="0.75em">Small</option>
                    <option value="1em">Normal</option>
                    <option value="1.5em">Large</option>
                    <option value="2em">Extra Large</option>
                    <option value="2.5em">Huge</option>
                  </select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditor(false);
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
                }}
                placeholder="Type your KaTeX equation here..."
                className="font-mono text-sm min-h-[100px] resize-y bg-card"
              />
            </div>
          )}
          <div
            className={`w-full overflow-x-auto py-0 ${isFocused ? "px-4 pt-4 border-t" : "px-0"}`}
            style={{
              fontSize: block.props.size,
              textAlign:
                block.props.textAlignment === "left"
                  ? "left"
                  : block.props.textAlignment === "right"
                    ? "right"
                    : "center",
            }}
          >
            <BlockMath
              math={block.props.equation}
              // @ts-ignore - react-katex typings are missing the settings prop but pass it through strictly to katex options
              settings={{ strict: false }}
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
