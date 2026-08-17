---
name: exam-chart-spec-processor
description: "AI Vision skill to extract charts and diagrams from images into purely ECharts-compatible JSON (spec.json) and generate PNGs locally without SVG."
---

# Chart and Diagram to ECharts JSON Processor

This skill is designed to parse exam questions containing images of charts, graphs, or geometry diagrams, and strictly output an ECharts `spec.json` configuration for it. It will then automatically render that JSON into a PNG using a local script.

- **STRICTLY FORBIDDEN TO GENERATE RAW SVG CODE**. Do not write raw `<svg>` tags manually. Build the `spec.json` using Cartesian ECharts plotting, and the rendering script will automatically generate both the PNG and SVG files for you from the JSON.

## Workflow

When tasked to process a folder of questions:

1. **Read the Question**: Read the `.md` file first to understand the context of the question (e.g., equations, angles, labels).
2. **View the Image**: Use `view_file` to look at the corresponding original image in the `imgs/` folder.
3. **Classify**: Determine if it is a `chart` (data like line/bar/pie), `diagram` (geometry, physics vectors, abstract math shapes), or `image` (a standard photograph).
4. **Generate JSON Spec**: If it is a chart or diagram, write a `spec.json` file.
   - For **Diagrams / Geometry**: HIDE the axes (`"show": false`), set `min`/`max` explicitly to create a Cartesian coordinate system, and plot the vertices using `type: "line"` to draw shapes.
   - **Points/Dots & Labels**: If the diagram has labeled dots (e.g., coordinate points), create a `scatter` series (with `"symbolSize": 12` and `"z": 10`). For the text labels attached to these points, **do not use `graphic`**. Instead, use the built-in `label` property inside the scatter data array (e.g., `label: { show: true, formatter: "(6, 1)", position: "top", color: "#000", textBorderColor: "#fff", textBorderWidth: 2 }`).
   - **Floating Text & Overlap Prevention**: **NEVER use the `graphic` component.** To place floating text (like "f(x) = x²"), use the `title` component. **ALWAYS add `"textBorderColor": "#fff"` and `"textBorderWidth": 2` to ALL labels** (`title.textStyle`, `markLine.label`, `scatter.label`) to create a white stroke/outline that prevents text from overlapping and being obscured by chart lines!
   - **Line Labels (Avoiding Collision)**: To name a line (e.g., "$l$"), use the `label` property directly on the `markLine`. **CRITICAL**: Do NOT use `position: "middle"` for `markLine.label` because it often collides with scatter points. Always use `position: "end"` or `position: "start"` so the line name is placed at the far edge of the line, away from the data points (e.g., `label: { show: true, formatter: "l", position: "end", textBorderColor: "#fff", textBorderWidth: 2 }`).
   - **Canvas-Relative Grid Padding & Tight Framing (Fill the Canvas)**: The chart/diagram content must prominently fill the canvas area (85%–92%) without excessive empty margins. Estimate padding proportionally relative to canvas width ($W$) and height ($H$):
     - **Geometry / Diagrams (`show: false` axes)**: Use tight ~4% padding (`left/right: ~4% W`, `top/bottom: ~4% H`, e.g., `18px` on 450x450, min 15px) and set coordinate `min`/`max` tightly around the shape boundaries (+5–10% margin for labels).
     - **Cartesian Graphs with Axes (`show: true` with arrows)**: Use relative margins (`left: ~6% W`, `right: ~8% W`, `top: ~9% H`, `bottom: ~7% H`, e.g. `27px, 36px, 40px, 31px` on 450x450). This provides just enough room for $x$ and $y$ axis end arrows and labels without creating bloated whitespace (do not use `containLabel: true` as it is unsupported in SSR).
     - **Data Charts (Bar / Line / Pie)**: Use compact padding (`left: ~7% W`, `right: ~5% W`, `top: ~8% H`, `bottom: ~7% H`).
   - **Isometric Coordinates (1:1 Aspect Ratio)**: For Cartesian geometry and math graphs, ensure the `grid` and data limits plot cleanly within the `square` preset canvas size (450x450). **To achieve a true 1:1 scale, the X-axis range (max - min) MUST be exactly equal to the Y-axis range (max - min).** For example, if Y goes from -1 to 9 (range 10), X must go from -5 to 5 (range 10) so circles and parabolas don't look warped.
5. **Create Description**: Create a description file `imgs/<question_name>.md` for each image containing the extracted text/data context.
6. **Render the Image**: Execute the local rendering script to generate the final images (it will automatically create both `.png` and `.svg`), passing the appropriate width and height based on the canvas presets (default 500x350, square 450x450, wide 600x250, echarts 600x400):
   ```bash
   node .agents/skills/exam-chart-spec-processor/scripts/render_echarts.cjs <path-to-json> <path-to-output-png> <width> <height>
   ```
7. **Update the Markdown**: Edit the original `.md` question file to replace the old image link with the new `_draw.png` link (use the PNG in the markdown, not the SVG).
8. **Logging**: After all files in the folder are processed, generate a final `imgs_summary.md` log file detailing the processing results.

## Typography & Font Size Standards

To ensure consistent readability across all exam diagrams and prevent oversized or unreadable labels:
- **Global Default**: Set root `"textStyle": { "fontSize": 14 }`.
- **Formulas & Titles**: Use `"fontSize": 16` inside `title.textStyle` (e.g. `fontStyle: "italic"` for math equations).
- **Point / Vertex Labels**: Use `"fontSize": 14` inside `scatter.data[].label` or `series.label`.
- **Line Names / Labels**: Use `"fontSize": 14` inside `markLine.label`.
- **Axis Names & Ticks**: Use `"fontSize": 14` for `nameTextStyle.fontSize` and `"fontSize": 12` for `axisLabel.fontSize`.
- **Anti-Collision**: ALWAYS pair text with `"textBorderColor": "#fff"` and `"textBorderWidth": 2`.

## ECharts JSON Rules

- **Isometric 1:1 Scale**: For all geometry diagrams and Cartesian function graphs, the coordinate domain MUST strictly maintain `(xAxis.max - xAxis.min) == (yAxis.max - yAxis.min)` on the `square` preset (`450×450`). Never use asymmetrical scales for geometry (e.g. circles, triangles, parabolas) as it warps geometric angles and aspect ratios.
- **Accuracy**: Try to trace the visual shape or data as accurately as possible. For curves, use dense data points (e.g., step of 0.2).
- **Titles**: ONLY add a `title` or floating label if it explicitly exists in the original image. Do not invent titles.
- **Styling**: Standardize on `#000` (black) for lines and text, and transparent or light fills for shapes unless otherwise specified.
- **Root Fields**: Include `"type": "chart"` or `"type": "diagram"` at the root of the JSON for metadata.
- **Clean Structure**: Do not use the `custom` series type with JavaScript functions or `graphic` components. Rely on coordinate-based series (`line`, `scatter`, `markLine`) and the `title` component for annotations.

## Reference Examples

See the [examples/](file:///home/toto/Documents/sicerdas/.agents/skills/exam-chart-spec-processor/examples) directory for complete templates:
- [sample-function.json](file:///home/toto/Documents/sicerdas/.agents/skills/exam-chart-spec-processor/examples/sample-function.json): Cartesian coordinate function curve ($f(x) = x^2$) with arrows and math formula title.
- [sample-geometry.json](file:///home/toto/Documents/sicerdas/.agents/skills/exam-chart-spec-processor/examples/sample-geometry.json): Geometry diagram with hidden axes, shape line vertices, and scatter point labels.
- [sample-chart.json](file:///home/toto/Documents/sicerdas/.agents/skills/exam-chart-spec-processor/examples/sample-chart.json): Categorical bar chart with data labels.
- [sample-description.md](file:///home/toto/Documents/sicerdas/.agents/skills/exam-chart-spec-processor/examples/sample-description.md): Companion description format.
- [sample-summary.md](file:///home/toto/Documents/sicerdas/.agents/skills/exam-chart-spec-processor/examples/sample-summary.md): Final summary log report template.

## Example Usage Request

"Use the exam-chart-spec-processor skill on the @[/home/toto/Documents/sicerdas/ori/001-020] folder."
