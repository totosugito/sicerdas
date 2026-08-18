import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { createReactBlockSpec, GenericPopover } from "@blocknote/react";
import { flip, offset, shift } from "@floating-ui/react";
import katex from "katex";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type EquationProps = {
    latex: string;
};

export function renderLatex(latex: string, displayMode = false) {
    return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
    });
}

function EquationEditor({ block, editor }: any) {
    const [editing, setEditing] = useState(!block.props.latex);
    const [draft, setDraft] = useState(block.props.latex);
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const closingRef = useRef(false);
    const pointerInsideRef = useRef(false);
    const dialogId = `bn-equation-dialog-${block.id}`;
    const inputId = `bn-equation-input-${block.id}`;
    const errorId = `bn-equation-error-${block.id}`;
    const isNewEquation = !block.props.latex;
    const previewLatex = editing ? draft : block.props.latex;

    const validationError = useMemo(() => {
        const latex = draft.trim();

        if (!latex) {
            return "";
        }

        try {
            katex.renderToString(latex, {
                displayMode: true,
                throwOnError: true,
                output: "htmlAndMathml",
            });
            return "";
        } catch (error) {
            return (
                error instanceof Error
                    ? error.message.replace(/^KaTeX parse error:\s*/i, "")
                    : "This equation could not be parsed."
            );
        }
    }, [draft]);

    const canSave = Boolean(draft.trim()) && !validationError;

    const resizeInput = useCallback((input: HTMLTextAreaElement | null) => {
        if (!input) {
            return;
        }

        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
    }, []);

    useEffect(() => {
        if (!editing) {
            setDraft(block.props.latex);
        }
    }, [block.props.latex, editing]);

    useEffect(() => {
        if (editing) {
            closingRef.current = false;
        }
    }, [editing]);

    useLayoutEffect(() => {
        if (!editing) {
            return;
        }

        resizeInput(inputRef.current);
    }, [draft, editing, resizeInput]);

    useLayoutEffect(() => {
        if (!editing) {
            return;
        }

        resizeInput(inputRef.current);
    }, [draft, editing, resizeInput]);

    function save() {
        if (closingRef.current) {
            return true;
        }

        const latex = draft.trim();

        if (!latex || validationError) {
            queueMicrotask(() => inputRef.current?.focus());
            return false;
        }

        closingRef.current = true;
        editor.updateBlock(block, { props: { latex } });
        setEditing(false);
        editor.focus();
        return true;
    }

    function cancel() {
        closingRef.current = true;

        if (!block.props.latex) {
            editor.updateBlock(block, { type: "paragraph", content: "" });
            editor.focus();
            return;
        }

        setDraft(block.props.latex);
        setEditing(false);
        editor.focus();
    }

    const focusInput = useCallback((element: HTMLTextAreaElement | null) => {
        inputRef.current = element;

        // The popover mounts after the editing state changes. Focusing from its
        // ref ensures the editor is ready without stealing focus on every keystroke.
        if (element) {
            resizeInput(element);
            queueMicrotask(() => {
                resizeInput(element);
                element.focus();
                element.setSelectionRange(element.value.length, element.value.length);
            });
        }
    }, [resizeInput]);

    return (
        <div className="bn-equation-host relative group" contentEditable={false}>
            {/* Hover Edit Button */}
            {!editing && editor.isEditable && previewLatex && (
                <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        className="px-2 py-0.5 text-[10px] bg-background border rounded shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditing(true);
                        }}
                    >
                        Edit
                    </button>
                </div>
            )}
            {previewLatex ? (
                <button
                    type="button"
                    ref={setAnchor}
                    className="bn-equation"
                    aria-label={`Edit equation: ${previewLatex}`}
                    aria-controls={editing ? dialogId : undefined}
                    aria-expanded={editing}
                    aria-haspopup="dialog"
                    data-editing={editing || undefined}
                    onClick={(e) => {
                        // Single click does not open the editor if it's already rendered
                        e.stopPropagation();
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (editor.isEditable) {
                            setEditing(true);
                        }
                    }}
                    dangerouslySetInnerHTML={{
                        __html: renderLatex(previewLatex, true),
                    }}
                />
            ) : (
                <button
                    type="button"
                    ref={setAnchor}
                    className="bn-equation"
                    aria-label="Edit equation"
                    aria-controls={editing ? dialogId : undefined}
                    aria-expanded={editing}
                    aria-haspopup="dialog"
                    data-editing={editing || undefined}
                    onClick={() => {
                        if (editor.isEditable) {
                            setEditing(true);
                        }
                    }}
                >
                    Add equation
                </button>
            )}
            {editing && (
                <GenericPopover
                    reference={
                        anchor
                            ? { element: anchor }
                            : { element: undefined, getBoundingClientRect: () => new DOMRect() }
                    }
                    useFloatingOptions={{
                        open: editing,
                        placement: "bottom-start",
                        middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
                        onOpenChange: (open, _event, reason) => {
                            if (!open) {
                                if (reason === "escape-key") {
                                    cancel();
                                } else {
                                    save();
                                }
                            }
                        },
                    }}
                    focusManagerProps={{ modal: false, disabled: true }}
                    elementProps={{
                        id: dialogId,
                        className: "bn-equation-popover",
                        role: "dialog",
                        "aria-label": isNewEquation ? "Add equation" : "Edit equation",
                    }}
                >
                    <div
                        ref={popoverRef}
                        className="bn-equation-popover__content"
                        onPointerDownCapture={() => {
                            pointerInsideRef.current = true;
                            window.setTimeout(() => {
                                pointerInsideRef.current = false;
                            });
                        }}
                    >
                        <textarea
                            id={inputId}
                            ref={focusInput}
                            aria-label="LaTeX"
                            aria-describedby={validationError ? errorId : undefined}
                            aria-invalid={Boolean(validationError)}
                            placeholder="e.g. e^{i\pi} + 1 = 0"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={() => {
                                if (pointerInsideRef.current) {
                                    return;
                                }

                                window.setTimeout(() => {
                                    if (
                                        !closingRef.current &&
                                        popoverRef.current &&
                                        !popoverRef.current.contains(document.activeElement)
                                    ) {
                                        save();
                                    }
                                });
                            }}
                            onKeyDown={(event) => {
                                event.stopPropagation();
                                if (
                                    (event.key === "Enter" && !event.shiftKey) ||
                                    ((event.metaKey || event.ctrlKey) && event.key === "Enter")
                                ) {
                                    event.preventDefault();
                                    save();
                                }
                                if (event.key === "Escape") {
                                    event.preventDefault();
                                    cancel();
                                }
                            }}
                            spellCheck={false}
                        />

                        <div className="bn-equation-popover__footer">
                            <span
                                id={validationError ? errorId : undefined}
                                className={validationError ? "bn-equation-popover__error" : undefined}
                                role={validationError ? "status" : undefined}
                            >
                                {validationError ? "Invalid LaTeX" : "Enter to apply · Esc to cancel"}
                            </span>
                            <button
                                type="button"
                                className="bn-equation-popover__button"
                                disabled={!canSave}
                                onClick={save}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </GenericPopover>
            )}
        </div>
    );
}

function EquationExternalHTML({ block }: any) {
    return (
        <div
            className="bn-equation"
            data-latex={block.props.latex}
            dangerouslySetInnerHTML={{ __html: renderLatex(block.props.latex, true) }}
        />
    );
}

/** A full-width LaTeX equation that edits directly in the editor. */
export const Equation = createReactBlockSpec(
    {
        type: "equation",
        content: "none",
        propSchema: {
            latex: { default: "" },
        },
    },
    {
        meta: { selectable: false },
        render: EquationEditor,
        toExternalHTML: EquationExternalHTML,
        parse: (element) => {
            const latexElement = element.matches("[data-latex]")
                ? element
                : element.querySelector<HTMLElement>("[data-latex]");
            const latex = latexElement?.getAttribute("data-latex");

            return latex === null || latex === undefined ? undefined : { latex };
        },
    },
)();

/** Spread this into `blockSpecs` when creating a BlockNote schema. */
export const mathBlockSpecs = {
    equation: Equation,
};

/** A slash-menu item for inserting a focused, empty equation block. */
export function getMathSlashMenuItems(editor: any) {
    return [
        {
            title: "Block equation",
            subtext: "Write a TeX formula",
            aliases: ["equation", "math", "latex", "formula", "eq", "block equation", "block math"],
            group: "Math",
            icon: <span aria-hidden="true">∑</span>,
            onItemClick: () => {
                insertOrUpdateBlockForSlashMenu(editor, {
                    type: "equation",
                    props: { latex: "" },
                } as any);
            },
        },
        {
            title: "Inline equation",
            subtext: "Insert TeX within text",
            aliases: ["inline equation", "inline math", "inline latex", "math", "equation"],
            group: "Math",
            icon: <span aria-hidden="true">√x</span>,
            onItemClick: () => {
                editor.insertInlineContent([
                    {
                        type: "latex",
                        props: { latex: "", displayMode: false },
                    },
                ]);
            },
        },
    ];
}