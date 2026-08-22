---
name: exam-auto-illustrator
description: Reads text-only exam questions and generates semantic geometric or schematic illustrations using pure ECharts JSON specification.
license: MIT
---

# Exam Auto-Illustrator Skill

This skill provides guidelines for agents to construct visual diagrams (Cartesian graphs, geometry, kinematics schemes, logic diagrams) strictly from text descriptions using **ECharts JSON**. 

Unlike `exam-chart-spec-processor` which extracts data from existing images, this skill focuses on **Imaginative Geometry Representation**.

## 1. Core Principles

1. **Interpret & Coordinate**: Read the text problem. Invent a logical coordinate system to place the shapes. (e.g., If a right triangle has base 3 and height 4, set vertices at A(0,0), B(3,0), and C(3,4)).
2. **NO MANUAL SVG**: Never write raw SVG code. Produce a `.spec.json` object. The local ECharts renderer script will convert it to PNG/SVG.
3. **Typography Standards**:
   - Global Default: Set root `"textStyle": { "fontSize": 14 }`.
   - **Optional Titles**: Chart `title` is OPTIONAL and should generally be omitted to save space and prevent clutter, unless absolutely necessary for context. If used, set `"fontSize": 16` inside `title.textStyle`.
   - Point Labels: `"fontSize": 14` inside `scatter` or `markLine` labels.
   - Text Readability: ALWAYS use `"textBorderColor": "#fff"` and `"textBorderWidth": 2` for all text labels overlapping lines.

## 2. Diagram Types & Strategies

### A. Pure Geometry (Triangles, Circles, Polygons)
- **Hide Axes**: Set `xAxis: { show: false }` and `yAxis: { show: false }`.
- **Canvas Rule (Isometric)**: You MUST enforce a 1:1 isometric scale. The distance `xAxis.max - xAxis.min` MUST EQUAL `yAxis.max - yAxis.min`. Example: if X ranges from -5 to 5 (delta 10), Y must range from -2 to 8 (delta 10). If this is violated, a circle will look like an oval.
- **Drawing**: Use a `line` series with coordinate pairs in `data`. To close a polygon, repeat the first coordinate at the end.
- **Vertices**: Add a `scatter` series to draw dots at the corners, and use `label` to name them (A, B, C).

### B. Mathematical Functions (Cartesian Graphs)
- **Show Axes**: Set `show: true`, use `axisLine: { symbol: ['none', 'arrow'] }` to draw coordinate arrows.
- **Curve Smoothing**: ECharts needs dense data points to draw mathematical curves. If drawing $f(x) = x^2$, generate an array of points `[x, y]` with a small step (e.g., 0.2) rather than just 3 points. Use `smooth: true` in the line series.
- **Always Use Legends**: When plotting multiple functions (e.g., $f(x)$ and $g(x)$), ALWAYS add `legend: { show: true, bottom: 0 }` to the chart and assign a simple string to each series `name` (e.g., `"name": "f(x)"` and `"name": "g(x)"`). Do NOT use LaTeX in the legend. This allows students to identify the curves directly on the image without relying solely on the text description.
- **Clean Legend (No Points)**: For line series representing continuous functions, always add `"symbol": "none"` to the series. This ensures that the line is drawn cleanly without data point dots, and the legend icon will correctly display as a simple line instead of a line with a dot.
- **Isometric Scale**: Maintain 1:1 scale if the shape is geometric (e.g. circle equation). For pure data/statistics, 1:1 is not required.

### C. Physics & Schematics (Kinematics, Forces)
- Use `markLine` heavily to draw vectors/arrows.
- Provide descriptive labels (e.g. $F = 10 \text{ N}$, $v_0$).
- Ensure the diagram fits the standard 450x450 square preset or 500x350 landscape preset.

## 3. Handling Parameterized Variations
If the markdown solution file contains a `variableFormulas.variables` array (multiple variation sets):
- You MUST generate a separate ECharts JSON for **each** variation set (e.g., `_auto_v1.spec.json`, `_auto_v2.spec.json`).
- Render each JSON to its corresponding PNG (`_auto_draw_v1.png`, `_auto_draw_v2.png`).
- You MUST modify the YAML frontmatter to inject an `img_path` key into each variation set indicating the correct image path. Example:
  ```yaml
  variableFormulas:
    variables:
      - x_val: 2
        img_path: "../imgs/01_q01_auto_draw_v1.png"
      - x_val: 3
        img_path: "../imgs/01_q01_auto_draw_v2.png"
  ```
- In the markdown solution, use the dynamic placeholder variable: `![Ilustrasi]({{img_path}})`.

If it is static (no variations), just use `_auto.spec.json` and `_auto_draw.png`.

## 4. Rendering the JSON
Once the `spec.json` is generated, it must be rendered using the existing renderer script from the chart processor skill:
`node .agents/skills/exam-chart-spec-processor/scripts/render_echarts.cjs <path-json> <path-png-output> <width> <height>`

Example:
`node .agents/skills/exam-chart-spec-processor/scripts/render_echarts.cjs imgs/01_q01_auto.spec.json imgs/01_q01_auto_draw.png 450 450`
