import { createReactInlineContentSpec, GenericPopover } from "@blocknote/react";
import { flip, offset, shift } from "@floating-ui/react";
import katex from "katex";
import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type LatexProps = {
    latex: string;
    displayMode: boolean;
};

function renderInlineLatex({ latex, displayMode }: LatexProps) {
    return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
    });
}

function LatexEditor({
    inlineContent,
    updateInlineContent,
    editor,
    contentRef,
}: any) {
    const props = inlineContent.props as LatexProps;
    const [editing, setEditing] = useState(!props.latex);
    const [draft, setDraft] = useState(props.latex);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const closingRef = useRef(false);
    const pointerInsideRef = useRef(false);
    const forwardedContentRef = useRef(contentRef);
    const id = useId().replace(/:/g, "");
    const popoverId = `bn-inline-equation-dialog-${id}`;
    const inputId = `bn-inline-equation-input-${id}`;
    const errorId = `bn-inline-equation-error-${id}`;
    const previewLatex = editing ? draft : props.latex;

    forwardedContentRef.current = contentRef;

    const validationError = useMemo(() => {
        const latex = draft.trim();

        if (!latex) {
            return "";
        }

        try {
            katex.renderToString(latex, {
                displayMode: props.displayMode,
                throwOnError: true,
                output: "htmlAndMathml",
            });
            return "";
        } catch (error) {
            return error instanceof Error
                ? error.message.replace(/^KaTeX parse error:\s*/i, "")
                : "This equation could not be parsed.";
        }
    }, [draft, props.displayMode]);

    const canSave = Boolean(draft.trim()) && !validationError;

    const resizeInput = useCallback((input: HTMLTextAreaElement | null) => {
        if (!input) {
            return;
        }

        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
    }, []);

    const setMathElement = useCallback((element: HTMLElement | null) => {
        setAnchor(element);
        forwardedContentRef.current(element);
    }, []);

    const focusInput = useCallback(
        (element: HTMLTextAreaElement | null) => {
            inputRef.current = element;

            if (element) {
                resizeInput(element);
                queueMicrotask(() => {
                    resizeInput(element);
                    element.focus();
                    element.setSelectionRange(element.value.length, element.value.length);
                });
            }
        },
        [resizeInput],
    );

    useEffect(() => {
        if (!editing) {
            setDraft(props.latex);
        }
    }, [editing, props.latex]);

    useEffect(() => {
        if (editing) {
            closingRef.current = false;
        }
    }, [editing]);

    useLayoutEffect(() => {
        if (editing) {
            resizeInput(inputRef.current);
        }
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
        updateInlineContent({
            type: "latex",
            props: { latex, displayMode: props.displayMode },
        });
        setEditing(false);
        editor.focus();
        return true;
    }

    function cancel() {
        closingRef.current = true;
        setDraft(props.latex);
        setEditing(false);
        editor.focus();
    }

    return (
        <>
            <span
                ref={setMathElement}
                className={`${props.displayMode ? "bn-latex bn-latex-display" : "bn-latex"} relative group inline-flex items-center`}
                data-latex={props.latex}
                data-editing={editing || undefined}
                contentEditable={false}
                role="button"
                tabIndex={0}
                aria-label={
                    previewLatex
                        ? `Edit inline equation: ${previewLatex}`
                        : "Add inline equation"
                }
                aria-controls={editing ? popoverId : undefined}
                aria-expanded={editing}
                aria-haspopup="dialog"
                onClick={(e) => {
                    if (!previewLatex && editor.isEditable) {
                        setEditing(true);
                    } else {
                        e.stopPropagation();
                    }
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (editor.isEditable) {
                        setEditing(true);
                    }
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        if (editor.isEditable) {
                            setEditing(true);
                        }
                    }
                }}
            >
                {previewLatex ? (
                    <span
                        className="bn-latex-rendered"
                        dangerouslySetInnerHTML={{
                            __html: renderInlineLatex({
                                latex: previewLatex,
                                displayMode: props.displayMode,
                            }),
                        }}
                    />
                ) : (
                    <span className="bn-latex-placeholder" aria-hidden="true">
                        ∑
                    </span>
                )}
                {/* Hover Edit Button */}
                {!editing && editor.isEditable && previewLatex && (
                    <span className="absolute -top-3.5 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    </span>
                )}
            </span>

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
                        id: popoverId,
                        className: "bn-equation-popover",
                        role: "dialog",
                        "aria-label": "Edit inline equation",
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
                            placeholder="e.g. E = mc^2"
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
        </>
    );
}

function LatexExternalHTML({ inlineContent, contentRef }: any) {
    const props = inlineContent.props as LatexProps;

    return (
        <span
            ref={contentRef}
            className={props.displayMode ? "bn-latex bn-latex-display" : "bn-latex"}
            data-latex={props.latex}
            aria-label={`Mathematical expression: ${props.latex}`}
            dangerouslySetInnerHTML={{ __html: renderInlineLatex(props) }}
        />
    );
}

/**
 * An inline BlockNote content type for a KaTeX-rendered LaTeX expression.
 * Click a formula to edit it in the compact LaTeX popover. Import KaTeX's
 * stylesheet in the host application: `import "katex/dist/katex.min.css"`.
 */
export const Latex = createReactInlineContentSpec(
    {
        type: "latex",
        content: "none",
        propSchema: {
            latex: { default: "" },
            displayMode: { default: false },
        },
    } as const,
    {
        render: LatexEditor,
        toExternalHTML: LatexExternalHTML,
        parse: (element) => {
            const latexElement = element.matches("[data-latex]")
                ? element
                : element.querySelector<HTMLElement>("[data-latex]");
            const latex = latexElement?.getAttribute("data-latex");

            if (latex === null || latex === undefined) {
                return undefined;
            }

            return {
                latex,
                displayMode:
                    element.getAttribute("data-display-mode") === "true" ||
                    element.classList.contains("bn-latex-display") ||
                    Boolean(element.querySelector(".bn-latex-display")),
            };
        },
    },
);

/** Spread this into `inlineContentSpecs` when creating a BlockNote schema. */
export const latexInlineContentSpecs = {
    latex: Latex,
};