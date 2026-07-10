# sn-legend

A Nebula.js chart extension for displaying a standalone legend in Qlik Sense.

## Features

- Categorical legend for dimension values, with configurable symbol shapes
- Gradient legend for measure ranges (sequential color schemes)
- Expression-based coloring: treat expression as categorical colors or gradient
- Configurable dock position: left, top, or auto (auto picks based on container aspect ratio)
- Responsive mode: always-visible or paginated with navigation arrows
- Tooltip support via `@qlik/custom-tooltips`
- Snapshot and bookmark support

## Installation

```bash
pnpm install
```

## Build

```bash
pnpm run build
```

This will create the distribution files in the `dist/` folder and the Qlik Sense extension in `sn-legend-ext/`.

## Build for Development

```bash
pnpm run build:dev
```

Builds in development mode and copies the extension to the Qlik Sense Desktop extensions folder automatically.

## Development

To build with watch mode:

```bash
pnpm run build:watch
```

To serve with Nebula.js dev server:

```bash
pnpm run start
```

## Deploy

To copy the built extension to the Qlik Sense Desktop extensions folder:

```bash
pnpm run deploy
```

## Usage

### Data Requirements

- **Dimension**: Optional — one dimension to color by dimension values (categorical legend)
- **Measure**: Optional — one measure to color by measure range (gradient legend)

### Color Modes

- **By Dimension** (default): Shows a categorical legend with one entry per dimension value
- **By Measure**: Shows a gradient legend representing the measure value range
- **By Expression**: Controlled by `legend.expressionTarget`:
  - `off` — legend not shown
  - `dimension` — expression produces categorical colors
  - `measure` — expression produces a sequential gradient

### Symbol Shapes

When coloring by dimension, each legend item displays a colored symbol. Available shapes:

- `square` (default), `circle`, `diamond`, `triangle`, `star`, `cross`, `saltire`

### Dock Position

- **left** (default): Legend docks to the left side
- **top**: Legend docks to the top
- **auto**: Picks `top` when container is wider than tall, `left` otherwise

### Responsive Mode

- **always**: Legend is always fully visible
- **auto**: Legend paginates with navigation arrows when space is constrained

## Properties Structure

```javascript
{
  color: {
    mode: 'byDimension' | 'byMeasure' | 'byExpression' | 'primary',
    measureScheme: 'sg',       // gradient color scheme
    dimensionScheme: '12',     // categorical color scheme
    reverseScheme: false,
    expressionIsColor: true
  },
  dataPoint: {
    symbol: 'square'           // legend item shape
  },
  legend: {
    dock: 'left' | 'top' | 'auto',
    show: true,
    showTitle: true,
    responsive: 'always' | 'auto',
    expressionTarget: 'off' | 'dimension' | 'measure'
  }
}
```

## Size

New standalone Nebula.js object. Line counts of what's actually authored — excludes the generated lockfile (~10.8k lines), `api-specifications/` (964), and the built `sn-legend-ext/` bundle:

| Category | Files | Lines |
|---|---|---|
| Source (`src/`, excl. tests) | 30 | 2,102 |
| Unit tests | 9 | 1,085 |
| **Authored total** | **39** | **3,187** |

Largest areas: `src/interactions/` (11 files), `src/services/` (6), `src/ext/` property panel (5), plus `components/`, `qae/`, and the picasso definition.

## License

MIT
