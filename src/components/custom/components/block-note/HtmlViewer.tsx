import parse, { domToReact } from 'html-react-parser';
import katex from 'katex';
import "katex/dist/katex.min.css";
import { alertTypes, getAlertStyles, AlertType } from './lib/alert-utils';

function renderMath(equation: string) {
    if (!equation) return '';
    return katex.renderToString(equation, {
        throwOnError: false,
        displayMode: true,
    });
}

export default function HtmlViewer({ html, className }: { html: string; className?: string }) {
    const options = {
        replace: (domNode: any) => {
            if (domNode.attribs && domNode.attribs['data-type'] === 'math') {
                const eq = domNode.attribs['data-equation'] || '';
                return (
                    <div
                        className="math-block py-2 my-2 flex justify-center overflow-x-auto scrollbar-hide"
                        dangerouslySetInnerHTML={{
                            __html: renderMath(eq),
                        }}
                    />
                );
            }

            if (domNode.attribs && domNode.attribs['data-type'] === 'alert') {
                const type = (domNode.attribs['data-alert-type'] || 'info') as AlertType;
                const currentType = alertTypes.find((t) => t.id === type) || alertTypes[0];
                const Icon = currentType.icon;
                const styles = getAlertStyles(type);

                return (
                    <div className={`alert-viewer flex items-start gap-4 p-4 my-4 rounded-xl border shadow-sm transition-all ${styles.wrapper}`}>
                        <div className="flex-shrink-0 pt-0.5">
                            <Icon className={`${styles.iconClassName} ${styles.icon}`} />
                        </div>
                        <div className="alert-content-container flex-1 prose-sm dark:prose-invert">
                            {domToReact(domNode.children, options)}
                        </div>
                    </div>
                );
            }
        },
    };

    if (!html) return null;
    return <div className={className}>{parse(html, options)}</div>;
}