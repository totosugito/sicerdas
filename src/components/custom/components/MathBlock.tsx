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
    },
    content: "none",
  },
  {
    render: (props) => {
      const { block, editor } = props;

      const isSelected = editor.getTextCursorPosition()?.block?.id === block.id;
      const [forceHide, setForceHide] = React.useState(false);

      React.useEffect(() => {
        if (!isSelected) {
          setForceHide(false);
        }
      }, [isSelected]);

      const isFocused = isSelected && !forceHide;

      return (
        <div
          className={`p-0 my-0 rounded-md transition-all ${isFocused ? "ring-1 ring-primary/20 bg-muted/50" : "hover:bg-muted/30 cursor-pointer"}`}
        >
          {isFocused && (
            <div className="flex flex-col p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  KaTeX Editor
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setForceHide(true);
                  }}
                  title="Close Editor"
                >
                  <IoMdClose className="h-4 w-4" />
                </Button>
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
            className={`flex justify-center text-center ${isFocused ? "px-4 pt-4 border-t" : "px-0"}`}
          >
            <BlockMath
              math={block.props.equation}
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
