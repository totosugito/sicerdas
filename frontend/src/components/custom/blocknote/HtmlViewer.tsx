import parse, { domToReact } from 'html-react-parser';
import katex from 'katex';
import "katex/dist/katex.min.css";
import { alertTypes, getAlertStyles, AlertType } from './lib/alert-utils';
import { ChartRenderer } from './block/charts';
import { cn } from "@/lib/utils";
import "@/assets/custom-blocknote.css";

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
            if (domNode.attribs && domNode.attribs['data-type'] === 'equation') {
                const eq = domNode.attribs['data-latex'] || '';
                return (
                    <div
                        className="math-block bn-equation py-2 my-2 flex justify-center overflow-x-auto scrollbar-hide"
                        dangerouslySetInnerHTML={{
                            __html: renderMath(eq),
                        }}
                    />
                );
            }

            if (domNode.attribs && domNode.attribs['data-type'] === 'chart') {
                try {
                    const chartData = JSON.parse(domNode.attribs['data-chart'] || '{}');
                    const alignment = chartData.options?.alignment || "center";
                    const width = chartData.options?.width || "full";
                    const widthClass = width === "small" ? "w-full md:w-1/2" : width === "medium" ? "w-full md:w-3/4" : "w-full";
                    const alignClass = alignment === "left" ? "mr-auto ml-0" : alignment === "right" ? "ml-auto mr-0" : "mx-auto";

                    return (
                        <div className={cn("my-4", widthClass, alignClass)}>
                            <ChartRenderer data={chartData} />
                        </div>
                    );
                } catch (e) {
                    console.error("Failed to parse chart HTML data attribute", e);
                }
            }

            if (domNode.attribs && domNode.attribs['data-type'] === 'alert') {
                const type = (domNode.attribs['data-alert-type'] || 'info') as AlertType;
                const currentType = alertTypes.find((t) => t.id === type) || alertTypes[0];
                const Icon = currentType.icon;
                const styles = getAlertStyles(type);

                return (
                    <div className={`alert-wrapper shadow-sm my-4 ${styles.wrapper}`} data-type={type}>
                        <div className="alert-icon-container">
                            <Icon size={styles.iconSize} className={`alert-icon ${styles.icon}`} />
                        </div>
                        <div className="alert-content inline-content prose-sm dark:prose-invert">
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
