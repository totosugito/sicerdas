import React from "react";
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

// The types of alerts that users can choose from.
export const alertTypes = [
  {
    id: "info",
    label: "Info",
    icon: Info,
    color: "blue",
  },
  {
    id: "warning",
    label: "Warning",
    icon: AlertTriangle,
    color: "amber",
  },
  {
    id: "success",
    label: "Success",
    icon: CheckCircle2,
    color: "green",
  },
  {
    id: "error",
    label: "Error",
    icon: XCircle,
    color: "red",
  },
] as const;

export const AlertBlock = createReactBlockSpec(
  {
    type: "alert",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "info",
        values: ["info", "warning", "success", "error"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { block, editor, contentRef } = props;
      const currentType = alertTypes.find((t) => t.id === block.props.type) || alertTypes[0];
      const Icon = currentType.icon;

      return (
        <div className="alert-wrapper" data-type={block.props.type}>
          {/* Interactive Icon with Popover for type switching */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <div
                className="alert-icon-container"
                title="Change alert type"
                contentEditable={false}
              >
                <Icon size={24} className="alert-icon" />
              </div>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content className="alert-type-popover" sideOffset={5} align="start">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-1">
                  Alert Type
                </div>
                {alertTypes.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className="alert-type-item"
                      onClick={() => {
                        editor.updateBlock(block, {
                          type: "alert",
                          props: { ...block.props, type: type.id },
                        });
                      }}
                    >
                      <TypeIcon
                        size={16}
                        className={
                          type.id === "info"
                            ? "text-blue-500"
                            : type.id === "warning"
                              ? "text-amber-500"
                              : type.id === "success"
                                ? "text-green-500"
                                : "text-red-500"
                        }
                      />
                      <span>{type.label}</span>
                    </div>
                  );
                })}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Editable Content Area - Using ref as shown in official example */}
          <div className="alert-content inline-content" ref={contentRef} />
        </div>
      );
    },
  },
);
