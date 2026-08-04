# BlockNote Chart Block — Data Format Specification

> Universal Chart Data Format (UCDF) for cross-platform chart rendering in BlockNote.js content.
> This format is **library-agnostic** — it describes *what data to show*, never *how to render it*.

---

## Overview

Course creators can insert interactive charts into BlockNote content via a custom `chart` block.
The chart data is stored as structured JSON in BlockNote's document model and serialized to HTML
for consumption by multiple platforms:

- **Web (React)** — rendered with ECharts via `ReactECharts`
- **Flutter Mobile** — rendered with `syncfusion_flutter_charts`

The data format is designed so that **changing the charting library on either platform requires
only updating the mapper function** — zero changes to stored data, HTML serialization, or the editor UI.

---

## Architecture

```
┌──────────────────┐
│  BlockNote Editor │  ← Course creator inserts chart via /chart slash command
│  (JSON document)  │
└────────┬─────────┘
         │ save
         ▼
┌──────────────────┐
│    Database       │  ← Stores BlockNote JSON with chart block props
│    (JSON)         │
└────────┬─────────┘
         │ blocknote_to_html()
         ▼
┌──────────────────────────────────────────────────────────┐
│  HTML Output                                             │
│  <div data-type="chart" data-chart-type="bar"            │
│       data-chart='{"chartType":"bar","categories":...}'> │
│    <table><!-- fallback --></table>                       │
│  </div>                                                  │
└──────────┬──────────────────────────────┬────────────────┘
           │                              │
   ┌───────▼────────┐            ┌────────▼─────────┐
   │  Web (React)   │            │  Flutter Mobile   │
   │  ECharts       │            │  Syncfusion       │
   │  mapper →      │            │  mapper →          │
   │  ReactECharts  │            │  SfCartesianChart  │
   └────────────────┘            └──────────────────┘
```

---

## Data Schema

### `ChartData` (root object)

| Field        | Type            | Required | Description                                                      |
|--------------|-----------------|----------|------------------------------------------------------------------|
| `chartType`  | `ChartType`     | ✅       | Visualization type                                               |
| `title`      | `string`        | ❌       | Chart title displayed above the chart                            |
| `categories` | `string[]`      | ✅       | Category labels (see meaning per chart type below)               |
| `series`     | `ChartSeries[]` | ✅       | One or more data series                                          |
| `options`    | `ChartOptions`  | ❌       | Display options (all optional, all booleans/primitives)           |

### `ChartType` (enum)

```
"bar" | "line" | "area" | "pie" | "doughnut" | "radar"
```

### `ChartSeries`

| Field    | Type       | Required | Description                                                                 |
|----------|------------|----------|-----------------------------------------------------------------------------|
| `name`   | `string`   | ✅       | Series name (used in legend and tooltips)                                   |
| `values` | `number[]` | ✅       | Data values — one per category, same order. Length MUST equal `categories.length` |
| `color`  | `string`   | ❌       | Hex color for this series (e.g. `"#3b82f6"`). Used for bar/line/area/radar  |
| `colors` | `string[]` | ❌       | Per-slice hex colors. Only for pie/doughnut. Length MUST equal `categories.length`. If omitted, renderer auto-generates a palette |

### `ChartOptions`

| Field        | Type      | Default | Applies to          | Description                          |
|--------------|-----------|---------|----------------------|--------------------------------------|
| `showLegend` | `boolean` | `true`  | All                  | Show/hide the legend                 |
| `showGrid`   | `boolean` | `true`  | bar, line, area      | Show/hide grid lines                 |
| `stacked`    | `boolean` | `false` | bar, line, area      | Stack multiple series                |
| `horizontal` | `boolean` | `false` | bar                  | Horizontal bar orientation           |
| `showValues` | `boolean` | `false` | All                  | Show data value labels on the chart  |
| `xAxisLabel` | `string`  | —       | bar, line, area      | X-axis label text                    |
| `yAxisLabel` | `string`  | —       | bar, line, area      | Y-axis label text                    |

---

## Categories Meaning by Chart Type

| Chart Type   | `categories` represents         | `series` represents                     |
|--------------|----------------------------------|-----------------------------------------|
| `bar`        | X-axis group labels              | Each series = one color group of bars   |
| `line`       | X-axis point labels              | Each series = one line                  |
| `area`       | X-axis point labels              | Each series = one filled area           |
| `pie`        | Slice labels                     | Typically 1 series; `values` = sizes    |
| `doughnut`   | Slice labels                     | Same as pie                             |
| `radar`      | Spoke/indicator names            | Each series = one polygon overlay       |

---

## JSON Examples

### Bar Chart — Student scores

```json
{
  "chartType": "bar",
  "title": "Student Performance by Subject",
  "categories": ["Math", "Science", "English", "History"],
  "series": [
    { "name": "Class A", "values": [85, 72, 91, 68], "color": "#3b82f6" },
    { "name": "Class B", "values": [78, 88, 76, 82], "color": "#10b981" }
  ],
  "options": {
    "showLegend": true,
    "showGrid": true
  }
}
```

### Line Chart — Progress over time

```json
{
  "chartType": "line",
  "title": "Weekly Quiz Scores",
  "categories": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
  "series": [
    { "name": "Quiz Score", "values": [65, 70, 68, 82, 90], "color": "#8b5cf6" }
  ],
  "options": {
    "xAxisLabel": "Week",
    "yAxisLabel": "Score"
  }
}
```

### Pie Chart — Grade distribution

```json
{
  "chartType": "pie",
  "title": "Grade Distribution",
  "categories": ["A", "B", "C", "D", "F"],
  "series": [
    {
      "name": "Grades",
      "values": [30, 35, 20, 10, 5],
      "colors": ["#22c55e", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"]
    }
  ]
}
```

### Radar Chart — Skill assessment

```json
{
  "chartType": "radar",
  "title": "Student Skill Assessment",
  "categories": ["Reading", "Writing", "Listening", "Speaking", "Grammar"],
  "series": [
    { "name": "Student A", "values": [90, 75, 85, 60, 70], "color": "#3b82f6" },
    { "name": "Student B", "values": [70, 85, 65, 90, 80], "color": "#f59e0b" }
  ]
}
```

### Area Chart — Enrollment trend (stacked)

```json
{
  "chartType": "area",
  "title": "Monthly Enrollment by Course",
  "categories": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "series": [
    { "name": "Mathematics", "values": [120, 135, 150, 142, 160, 175], "color": "#3b82f6" },
    { "name": "Science", "values": [80, 95, 88, 102, 110, 115], "color": "#10b981" }
  ],
  "options": {
    "stacked": true,
    "xAxisLabel": "Month",
    "yAxisLabel": "Students"
  }
}
```

---

## HTML Serialization

When BlockNote JSON is converted to HTML (via `blocksToHTMLLossy` / `toExternalHTML`), the chart
block serializes to:

```html
<div data-type="chart"
     data-chart-type="bar"
     data-chart='{"chartType":"bar","title":"Student Performance","categories":["Math","Science","English"],"series":[{"name":"Score","values":[85,72,91],"color":"#3b82f6"}],"options":{"showLegend":true}}'>
  <!-- Fallback table for non-JS clients (email, screen readers, plain HTML) -->
  <table>
    <thead>
      <tr><th></th><th>Math</th><th>Science</th><th>English</th></tr>
    </thead>
    <tbody>
      <tr><td>Score</td><td>85</td><td>72</td><td>91</td></tr>
    </tbody>
  </table>
</div>
```

### Attribute Reference

| Attribute          | Purpose                                                        |
|--------------------|----------------------------------------------------------------|
| `data-type`        | `"chart"` — identifies this as a chart block for HTML parsers  |
| `data-chart-type`  | Quick-access chart type without parsing JSON                   |
| `data-chart`       | Full chart data as a JSON string                               |

### Why a single `data-chart` JSON attribute?

- **Simplicity** — one attribute to parse on any platform
- **Extensibility** — add new fields without new HTML attributes
- **Consistency** — mirrors the JSON structure stored in the database
- **Easy parsing** — `JSON.parse(attr)` on web, `jsonDecode(attr)` on Flutter

---

## Platform Rendering

### Web — HtmlViewer.tsx

```tsx
// In HtmlViewer options.replace:
if (domNode.attribs?.['data-type'] === 'chart') {
  const chartType = domNode.attribs['data-chart-type'] || 'bar';
  const chartData = JSON.parse(domNode.attribs['data-chart'] || '{}');
  const echartsOption = chartDataToEChartsOption(chartData);
  return <ReactECharts options={echartsOption} className="h-[300px]" />;
}
```

### Flutter

```dart
if (element.attributes['data-type'] == 'chart') {
  final chartData = jsonDecode(element.attributes['data-chart'] ?? '{}');
  return ChartWidget(data: chartData); // uses syncfusion_flutter_charts
}
```

### Mapper Contract

Each platform implements **one mapper function**:

```
Web:     chartDataToEChartsOption(data: ChartData) → EChartsOption
Flutter: chartDataToSfChart(data: ChartData) → Widget
```

**Switching libraries** only requires replacing the mapper:

```
Web:     chartDataToRechartsProps(data: ChartData) → RechartsProps    // future swap
Flutter: chartDataToFlChartData(data: ChartData) → FlChartData        // future swap
```

Zero changes to: stored data, HTML serialization, BlockNote block definition, or editor UI.

---

## BlockNote Block Structure

### Props stored in BlockNote JSON

```json
{
  "type": "chart",
  "props": {
    "chartType": "bar",
    "title": "...",
    "categories": ["..."],
    "series": [{ "name": "...", "values": [...], "color": "#..." }],
    "options": { "showLegend": true }
  },
  "content": "none"
}
```

### File Structure

```
src/components/custom/blocknote/block/chart/
├── index.ts              # Exports chartBlockSpec, getChartSlashMenuItems
├── chart-block.tsx       # createReactBlockSpec definition + toExternalHTML
├── chart-editor.tsx      # Inline data editor (table + type selector + options)
├── chart-renderer.tsx    # Renders chart using ReactECharts
├── chart-mapper.ts       # chartDataToEChartsOption() — the ONLY library-specific file
├── chart-types.ts        # TypeScript interfaces (ChartData, ChartSeries, ChartOptions)
└── styles.css            # Chart block styling
```

### Editor UX

1. User types `/chart` in the slash menu
2. A chart block appears with default sample data (bar chart)
3. Clicking the block opens an inline editor panel with:
   - Chart type selector (icon buttons for bar/line/pie/area/doughnut/radar)
   - Title input field
   - Data table (spreadsheet-style: rows = series, columns = categories)
   - Options toggles (legend, grid, stacked, horizontal, show values)
4. Chart renders live as data is edited

---

## Design Rules

1. **Colors are hex strings** — `#3b82f6`, not CSS variables or theme tokens
2. **Options are flat booleans/strings** — no nested render configuration
3. **No render hints** — no font sizes, padding, or animation config in stored data
4. **Platform decides UX** — each renderer controls its own theming, tooltips, animations
5. **`values.length === categories.length`** — strictly enforced
6. **Pie/doughnut typically use 1 series** — multiple series is allowed but unusual

---

## Editor UX

### Inserting a Chart

User types `/chart` in the slash menu → a chart block is inserted with **default sample data**:

```json
{
  "chartType": "bar",
  "title": "Chart Title",
  "categories": ["Category 1", "Category 2", "Category 3"],
  "series": [
    { "name": "Series 1", "values": [40, 65, 50], "color": "#3b82f6" }
  ]
}
```

The user immediately sees a rendered bar chart — **no blank state**.

### Chart Block Layout (View Mode)

```
┌─────────────────────────────────────────────────┐
│  Student Performance by Subject          [✏️ 📊] │  ← title + edit/type buttons
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │          ██                               │  │
│  │    ██    ██          ██                    │  │
│  │    ██    ██    ██    ██                    │  │
│  │    ██    ██    ██    ██    ██              │  │
│  │  ──────────────────────────────           │  │
│  │   Math  Sci   Eng   His   Art             │  │
│  │          ● Class A  ● Class B             │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Editor Panel (Edit Mode)

Clicking the **edit button (✏️)** or **double-clicking** the chart opens an inline editor panel
**below the chart** (stays in document flow). The panel has **3 tabs**:

#### Tab 1: Data (📋)

A mini spreadsheet-style table for editing chart data.

```
┌──────────────────────────────────────────────────────┐
│  📋 Data    📊 Chart Type    ⚙️ Options               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Title: [ Student Performance by Subject          ]  │
│                                                      │
│  ┌──────────┬─────────┬─────────┬─────────┬────────┐ │
│  │          │  Math   │ Science │ English │   [+]  │ │  ← add column
│  ├──────────┼─────────┼─────────┼─────────┤        │ │
│  │ Class A  │   85    │   72    │   91    │        │ │
│  │ 🎨#3b82f6│         │         │         │   [🗑️] │ │
│  ├──────────┼─────────┼─────────┼─────────┤        │ │
│  │ Class B  │   78    │   88    │   76    │        │ │
│  │ 🎨#10b981│         │         │         │   [🗑️] │ │
│  ├──────────┼─────────┼─────────┼─────────┤        │ │
│  │   [+ Add Series]                       │        │ │
│  └──────────┴─────────┴─────────┴─────────┴────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Data Table Features:**

| Feature | Description |
|---|---|
| Editable cells | Click any cell to type a number |
| Editable headers | Click category names to rename (e.g., "Math" → "Mathematics") |
| Editable series names | Click "Class A" to rename |
| Add column `[+]` | Adds a new category |
| Add row `[+ Add Series]` | Adds a new data series with auto-assigned color |
| Delete row `[🗑️]` | Removes a series |
| Delete column | Hover on column header → delete icon |
| Color picker `[🎨]` | Click color swatch next to series name to pick a color |
| Live preview | Chart re-renders in real-time as you type |
| Keyboard navigation | Tab between cells, Enter to confirm, Arrow keys to move |

#### Tab 2: Chart Type (📊)

Visual type selector with icon buttons. Clicking a type **instantly** re-renders the preview.
Data stays the same — only the visualization changes.

```
┌──────────────────────────────────────────────────────┐
│  📋 Data    📊 Chart Type    ⚙️ Options               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Select chart type:                                  │
│                                                      │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                │
│  │ ▐▐▌ │  │  📈 │  │ ▓▓▓ │  │ 🥧  │                │
│  │ Bar  │  │Line │  │Area │  │ Pie │                │
│  │ [✔️] │  │     │  │     │  │     │                │
│  └─────┘  └─────┘  └─────┘  └─────┘                │
│                                                      │
│  ┌─────┐  ┌─────┐                                   │
│  │ 🍩  │  │ 🕸️  │                                   │
│  │Donut│  │Radar│                                   │
│  │     │  │     │                                   │
│  └─────┘  └─────┘                                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Tab 3: Options (⚙️)

Toggle switches for display options. **Context-aware** — only shows options relevant to the
current chart type.

```
┌──────────────────────────────────────────────────────┐
│  📋 Data    📊 Chart Type    ⚙️ Options               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Display                                             │
│  ┌────────────────────────────────────┬────────┐     │
│  │ Show Legend                        │  [✔️]  │     │
│  │ Show Grid Lines                    │  [✔️]  │     │
│  │ Show Data Values                   │  [ ]   │     │
│  └────────────────────────────────────┴────────┘     │
│                                                      │
│  Layout                          (bar only)          │
│  ┌────────────────────────────────────┬────────┐     │
│  │ Stacked                            │  [ ]   │     │
│  │ Horizontal                         │  [ ]   │     │
│  └────────────────────────────────────┴────────┘     │
│                                                      │
│  Axis Labels                     (cartesian only)    │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ X: [Subject] │  │ Y: [Score  ] │                  │
│  └──────────────┘  └──────────────┘                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Visibility rules:**

| Option | Shown for |
|---|---|
| Show Legend | All chart types |
| Show Grid Lines | bar, line, area |
| Show Data Values | All chart types |
| Stacked | bar, area |
| Horizontal | bar |
| Axis Labels | bar, line, area |

### Interaction Reference

| Action | How |
|---|---|
| Insert chart | Type `/chart` in slash menu |
| Change chart type | Click 📊 tab → select type icon |
| Edit data | Click ✏️ or double-click chart → Data tab |
| Add a category | Click `[+]` column button in data table |
| Add a series | Click `[+ Add Series]` row button |
| Remove a category | Hover column header → delete icon |
| Remove a series | Click 🗑️ on the series row |
| Change colors | Click color swatch next to series name |
| Toggle options | Click ⚙️ tab → flip switches |
| Rename title | Edit title text field at top of Data tab |
| Delete entire chart | BlockNote's standard block delete (backspace on empty, or drag handle menu) |

---

## Smart Behaviors

| Behavior | Description |
|---|---|
| **Live preview** | Chart re-renders on every keystroke in the data table |
| **Auto-color** | New series get automatically assigned colors from a preset palette |
| **Type switching preserves data** | Switching from bar → pie keeps all data; only the visualization changes |
| **Pie validation** | When switching to pie/doughnut, show a gentle hint if multiple series exist ("Pie charts work best with a single series") |
| **Empty state** | If all data is deleted, show a placeholder with "Click to add chart data" |
| **Paste support** | Paste tab-separated data from a spreadsheet (Excel/Google Sheets) into the data table |
| **Keyboard navigation** | Tab between cells, Enter to confirm, Arrow keys to move |

---

## Color Palettes

Instead of requiring users to know hex codes, offer preset palettes for auto-assigning series colors.
Users can also pick custom colors via a color picker.

| Palette | Colors |
|---|---|
| **Default** | `#3b82f6` `#10b981` `#f59e0b` `#ef4444` `#8b5cf6` `#ec4899` |
| **Ocean** | `#0ea5e9` `#06b6d4` `#14b8a6` `#22c55e` `#84cc16` `#eab308` |
| **Sunset** | `#f43f5e` `#f97316` `#f59e0b` `#eab308` `#a3e635` `#22c55e` |
| **Monochrome** | `#1e293b` `#334155` `#475569` `#64748b` `#94a3b8` `#cbd5e1` |

Auto-color assignment: when a new series is added, it picks the next color from the **Default**
palette. If all 6 are used, it cycles back from the beginning.

---

## Implementation Tasks

### Phase 1 — MVP

- [x] **Types & schema** — Created `chart-types.ts` with `ChartData`, `ChartSeries`, `ChartOptions` interfaces
- [x] **Chart block definition** — Created `chart-block.tsx` with `createReactBlockSpec` (propSchema, `toExternalHTML` with fallback table, alignment & width container styles)
- [x] **Chart mapper** — Created `chart-mapper.ts` with `chartDataToEChartsOption()` for bar, line, pie, doughnut, area, radar with custom HTML popover tooltips
- [x] **Chart renderer** — Created `chart-renderer.tsx` wrapping `ReactECharts` with mapper and clean transparent viewer mode
- [x] **Slash menu item** — Created `getChartSlashMenuItem()` in `index.ts`
- [x] **Register in schema** — Registered chart block in `blocknote-config.ts` schema and `VALID_BLOCK_TYPES`
- [x] **Data editor** — Created `chart-editor.tsx` with compact responsive grids (max 3-column / 4-column layout), inline title input, add/remove controls
- [x] **Chart type selector** — Added chart type tab with icon buttons for bar, line, pie
- [x] **Options panel** — Added options tab with toggles (showLegend, showGrid, showValues), Alignment (Left, Center, Right), and Container Width (Full 100%, Medium 75%, Small 50%)
- [x] **Color picker** — Added circular color swatch per series with native color picker
- [x] **Live preview** — Wired data changes to re-render the chart in real-time with draft state & Save/Cancel action buttons
- [x] **Default sample data** — Insert sensible default sample data when chart block is inserted
- [x] **HtmlViewer support** — Added `data-type="chart"` node handler in `HtmlViewer.tsx` with clean responsive container alignment & width
- [x] **BlockNoteStatic support** — Verified clean chart rendering without header controls or card borders in read-only mode
- [x] **Styles** — Created `styles.css` with CSS variables (`.bn-chart-tab-trigger`, `.bn-chart-type-card`, `.bn-chart-section-card`, `.bn-chart-editor-container`) supporting Dark & Light themes
- [x] **ECharts PieChart import** — Registered `PieChart` in `ReactECharts.tsx` `use()` call

### Phase 2 — Extended

- [x] **Additional chart types** — Added area, doughnut, radar, scatter support to types & `chart-mapper.ts` (with dedicated polar indicator mapping & scatter symbol size)
- [x] **Enhanced ECharts Tooltips** — Implemented custom HTML formatters matching shadcn popovers with slice color badges, tabular numbers, and percentage pills
- [x] **Draft & Save / Cancel** — Added local draft state with header action buttons (**Done** / **Cancel**)
- [x] **Alignment & Container Width** — Added Left/Center/Right alignment and 100%/75%/50% width controls
- [x] **Stacked option** — Implemented `stacked` toggle switch in `chart-editor.tsx` Options tab & mapper
- [x] **Horizontal bar** — Implemented `horizontal` toggle switch for bar charts in `chart-editor.tsx` Options tab & mapper
- [x] **Axis labels** — Added `xAxisLabel` & `yAxisLabel` inputs under Options tab & rendered in mapper
- [x] **Color palette presets** — Added `PALETTES` presets selector (Default, Ocean, Sunset, Monochrome) under Options tab with slice & series color updates
- [x] **Export chart as image** — Added `Export Image` button in `chart-block.tsx` calling `getInstanceByDom().getDataURL()` to export high-res 2x PNGs
- [ ] **Paste from spreadsheet** — Support pasting tab-separated data (TSV/CSV) from Excel/Google Sheets directly into the editor grid
- [ ] **Flutter mapper** — Document/implement `chartDataToSfChart()` for mobile Flutter app (`syncfusion_flutter_charts`)

---

## Next Actionable Tasks

1. **Spreadsheet Data Import (Paste from Excel / Sheets)**:
   - Listen to `onPaste` event in `chart-editor.tsx` to automatically parse tab-separated (`\t`) or comma-separated (`\n`, `,`) data rows and populate categories and series values.

2. **Chart PNG Image Export**:
   - Add a download/export icon button in `chart-editor.tsx` / `chart-renderer.tsx` calling `echartsInstance.getDataURL()` to save the rendered chart as a high-res PNG image.

3. **Flutter Syncfusion Mobile Specs**:
   - Write the JSON-to-`syncfusion_flutter_charts` mapping helper logic in spec for the Flutter mobile application.
