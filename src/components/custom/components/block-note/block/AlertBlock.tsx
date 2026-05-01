import React from "react";
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import * as Popover from "@radix-ui/react-popover";
import { alertTypes, getAlertStyles, AlertType } from "../lib/alert-utils";

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
      const type = block.props.type as AlertType;
      const currentType = alertTypes.find((t) => t.id === type) || alertTypes[0];
      const Icon = currentType.icon;
      const styles = getAlertStyles(type);

      return (
        <div className={`alert-wrapper shadow-sm ${styles.wrapper}`} data-type={type}>
          {/* Interactive Icon with Popover for type switching */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <div
                className="alert-icon-container"
                title="Change alert type"
                contentEditable={false}
              >
                <Icon size={styles.iconSize} className={`alert-icon ${styles.icon}`} />
              </div>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content className="alert-type-popover" sideOffset={5} align="start">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-1">
                  Alert Type
                </div>
                {alertTypes.map((typeOption) => {
                  const TypeIcon = typeOption.icon;
                  const optionStyles = getAlertStyles(typeOption.id);
                  return (
                    <div
                      key={typeOption.id}
                      className="alert-type-item"
                      onClick={() => {
                        editor.updateBlock(block, {
                          type: "alert",
                          props: { ...block.props, type: typeOption.id },
                        });
                      }}
                    >
                      <TypeIcon
                        size={16}
                        className={optionStyles.icon}
                      />
                      <span>{typeOption.label}</span>
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
