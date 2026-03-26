import { dockLayout } from '@qlik/chart-commons';
import extend from 'extend';
import brushLegendRange from './components/brush-legend-range';
import interactions from './interactions';
import createDisclaimer from './components/disclaimer';

/**
 * Convert a Qlik attribute-expression cell to a CSS color string.
 * Handles:
 *   - ARGB(alpha,red,green,blue)  e.g. ARGB(255,255,105,0)  → rgba(255,105,0,1)
 *   - RGB(red,green,blue)         e.g. RGB(255,105,0)        → rgb(255,105,0)
 *   - Any other qText string      (CSS hex / named color)    → returned as-is
 *   - Numeric qNum fallback       (Qlik packed RGB integer)  → rgb(r,g,b)
 */
function parseAttrExprColor(attrCell) {
  if (!attrCell) return null;
  if (attrCell.qText && attrCell.qText !== 'NaN' && attrCell.qText !== '') {
    const text = attrCell.qText.trim();
    const argb = text.match(/^ARGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (argb) {
      const [al, r, g, b] = argb.slice(1).map(Number);
      return `rgba(${r},${g},${b},${(al / 255).toFixed(3)})`;
    }
    const rgb = text.match(/^RGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgb) {
      const [r, g, b] = rgb.slice(1).map(Number);
      return `rgb(${r},${g},${b})`;
    }
    return text; // already a valid CSS color (hex, named, etc.)
  }
  if (typeof attrCell.qNum === 'number' && !isNaN(attrCell.qNum)) {
    const n = attrCell.qNum >>> 0;
    return `rgb(${(n >>> 16) & 0xff},${(n >>> 8) & 0xff},${n & 0xff})`;
  }
  return null;
}

// Fix #2: removed unused first parameter ({} = {})
function computeScales(opts = {}) {
  const scales = {};
  extend(scales, opts.colorService.getScales());
  return scales;
}

function resolveAutoLegendDock(chart) {
  if (chart && chart.element) {
    return chart.element.clientWidth > chart.element.clientHeight ? 'top' : 'left';
  }
  return 'left';
}

/**
 * Fix #1: extracted from three identical inline blocks.
 * When responsive === 'always', inflate the picasso logical container so
 * validateReduceRect never removes the legend due to insufficient space.
 * The physical element's overflow:hidden clips any overflow instead.
 */
function applyAlwaysShow(s, chart) {
  const el = chart && chart.element;
  const physW = (el && el.clientWidth) || 0;
  const physH = (el && el.clientHeight) || 0;
  s.size = { width: Math.max(physW, 400), height: Math.max(physH, 300) };
  s.center = { minWidthRatio: 0, minHeightRatio: 0 };
}

/**
 * Fix #5: shared sort for the sequential-color scale's range/domain functions.
 * Both receive e.data.items from the same extraction; sorting once per function
 * call is unavoidable but at least the logic lives in one place.
 */
function sortedItemsByValue(items) {
  return [...(items ?? [])].sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
}

/**
 * Legend chart composition: renders only a legend — no chart body.
 */
export default function picassoDefinition({ layout, context, selectionService }, opts = {}) {
  const scales = computeScales(opts); // Fix #2: no longer passes unused {}

  const disclaimer = createDisclaimer(opts, context);

  if (opts.disclaimerService.getHasSuppressingDisclaimer()) {
    return {
      components: [disclaimer],
    };
  }

  const navigationDisabled =
    layout.legend?.responsive === 'always'
      ? false
      : context.constraints.select || context.constraints.active;

  // If byExpression and expressionTarget is 'off', skip the legend entirely
  const isExpressionOff =
    layout.color?.mode === 'byExpression' && layout.legend?.expressionTarget === 'off';

  if (isExpressionOff) {
    return {
      interactions: interactions(selectionService, opts, context),
      scales,
      components: opts.pluginService.extendComponents([disclaimer].filter(Boolean)),
      palettes: opts.colorService.getPalettes(),
      strategy: dockLayout(layout, opts),
    };
  }

  // Resolve dock: 'auto' must be converted to a real value before passing to getLegend/dockLayout
  let resolvedDock = layout.legend?.dock ?? 'auto';
  if (resolvedDock === 'auto') {
    resolvedDock = resolveAutoLegendDock(opts.chart);
  }

  // Build patched legendLayout so dockLayout receives a concrete dock value (not 'auto')
  const patchedLegendLayout = {
    ...layout,
    legend: {
      ...layout.legend,
      dock: resolvedDock,
    },
  };

  const alwaysShow = layout.legend?.responsive === 'always';

  // byExpression + dimension: getLegend() returns nothing (type "color" has no legend).
  // Build a legend-cat manually: labels from qDimensionInfo/0, colors from qAttrExps (the
  // colorByExpression attribute expression added by data.js / property-definition.js).
  if (layout.color?.mode === 'byExpression' && layout.legend?.expressionTarget === 'dimension') {
    const dimTitleStyle = opts.styleService.legend.title.getStyle();
    const dimTitle = layout.qHyperCube?.qDimensionInfo?.[0]?.qFallbackTitle ?? '';
    const dimShowTitle = layout.legend?.showTitle !== false;

    scales.legendExprFill = {
      data: {
        extract: {
          field: 'qDimensionInfo/0',
          value: (v) => v.qElemNumber,
          label: (v) => v.qText,
          trackBy: (v) => v.qElemNumber,
          reduce: 'first',
          props: {
            // colorByExpression attr expr is at qAttrExprInfo index 0 on the dimension cell.
            // qAttrExps.qValues[0] holds the evaluated color result (qText = CSS / Qlik RGB string).
            exprColor: {
              field: 'qDimensionInfo/0',
              value: (v) => parseAttrExprColor(v.qAttrExps?.qValues?.[0]),
            },
          },
        },
      },
    };

    const manualLegend = {
      type: 'legend-cat',
      key: 'legend-cat',
      scale: 'legendExprFill',
      layout: {
        dock: resolvedDock,
        minimumLayoutMode: alwaysShow ? 'SPARK' : undefined,
      },
      settings: {
        item: {
          shape: {
            type: layout.dataPoint?.symbol ?? 'square',
            // d is the resolver context: { datum, data, resources }
            // datum.exprColor.value is the color string from the prop extraction
            fill: (d) => d.datum?.exprColor?.value ?? '#cccccc',
          },
        },
        navigation: { disabled: navigationDisabled },
        title: {
          show: dimShowTitle,
          text: dimShowTitle ? dimTitle : '',
          fill: dimTitleStyle.color,
          fontSize: dimTitleStyle.fontSize,
          fontFamily: dimTitleStyle.fontFamily,
        },
      },
      brush: {
        consume: [
          {
            context: 'selection',
            // '' (empty string) matches the datum's top-level 'value' property in
            // containsMappedData — same convention used by getLegend() in chart-commons.
            // 'qDimensionInfo/0' would filter for a key that never exists in status[].key,
            // making every item permanently inactive.
            data: [''],
            style: { inactive: { opacity: 0.3 } },
          },
        ],
        // No brush.trigger here — tap.js handles all brush updates via chart.brushFromShapes().
        // Adding a trigger here would cause a double-toggle on each tap (picasso's component
        // event system fires independently of the chart-level Hammer gesture).
      },
    };

    const exprDimComponents = [manualLegend, disclaimer].filter(Boolean);

    return {
      interactions: interactions(selectionService, opts, context),
      scales,
      components: opts.pluginService.extendComponents(exprDimComponents),
      palettes: opts.colorService.getPalettes(),
      strategy: (() => {
        const s = dockLayout(patchedLegendLayout, opts);
        if (alwaysShow) applyAlwaysShow(s, opts.chart); // Fix #1
        return s;
      })(),
    };
  }

  // byExpression + measure: build a sequential legend whose color stops come from the
  // color expression evaluated per data point, positioned by the actual measure values.
  // The standard getLegend() path would produce a quant-palette gradient over min/max
  // Qlik RGB integers — wrong colors and wrong axis labels. We handle this manually.
  if (layout.color?.mode === 'byExpression' && layout.legend?.expressionTarget === 'measure') {
    const exprColorFn = (v) => parseAttrExprColor(v.qAttrExps?.qValues?.[0]);

    // fill scale: sequential-color where domain = sorted measure values and range = the
    // corresponding expression colors.  legend-seq's generateStopNodes calls
    //   fillScale.domain().map(d => ({ color: fillScale(d), offset: majorScale.norm(d) }))
    // so fillScale(d) MUST return a CSS color string — a plain data-extract scale returns
    // the raw qNum instead, which is what caused the CanvasGradient.addColorStop error.
    // The range/domain functions receive { data, resources } where data.items contains
    // the extracted datum objects: { value: qNum, exprColor: { value: cssColor } }.
    scales.fill = {
      type: 'sequential-color',
      data: {
        extract: {
          field: 'qMeasureInfo/0',
          value: (v) => v.qNum,
          label: (v) => v.qText,
          props: {
            exprColor: {
              field: 'qDimensionInfo/0',
              value: exprColorFn,
            },
          },
        },
      },
      // Fix #5: sortedItemsByValue shared helper reduces duplicated sort logic
      range: function (e) {
        const sorted = sortedItemsByValue(e.data?.items);
        const colors = sorted.map((item) => item.exprColor?.value ?? null).filter(Boolean);
        if (colors.length === 0) return ['#cccccc', '#cccccc'];
        if (colors.length === 1) return [colors[0], colors[0]];
        return colors;
      },
      domain: function (e) {
        const sorted = sortedItemsByValue(e.data?.items);
        const values = sorted.map((item) => item.value).filter((v) => typeof v === 'number' && !isNaN(v));
        if (values.length === 0) return [0, 1];
        if (values.length === 1) return [values[0], values[0]];
        return values;
      },
    };

    // fillRange scale: actual measure values for axis tick labels
    scales.fillRange = {
      data: {
        extract: {
          field: 'qMeasureInfo/0',
          value: (v) => v.qNum,
          label: (v) => v.qText,
        },
      },
    };

    // Invert for vertical (left/right) docks
    if (resolvedDock === 'right' || resolvedDock === 'left' || context.rtl) {
      scales.fillRange.invert = true;
    }

    const labelStyle = opts.styleService.legend.label.getStyle();
    const titleStyle = opts.styleService.legend.title.getStyle();
    const measureTitle = layout.qHyperCube?.qMeasureInfo?.[0]?.qFallbackTitle ?? '';
    const showTitle = layout.legend?.showTitle !== false;

    const manualSeqLegend = {
      type: 'legend-seq',
      key: 'legend-seq',
      layout: {
        dock: resolvedDock,
        minimumLayoutMode: alwaysShow ? 'SPARK' : undefined,
      },
      settings: {
        fill: 'fill',
        major: 'fillRange',
        length: 1,
        tick: {
          fill: labelStyle.color,
          fontSize: labelStyle.fontSize,
          fontFamily: labelStyle.fontFamily,
        },
        title: {
          show: showTitle,
          text: showTitle ? measureTitle : '',
          fill: titleStyle.color,
          fontSize: titleStyle.fontSize,
          fontFamily: titleStyle.fontFamily,
          padding: parseFloat(titleStyle.fontSize) || 16,
        },
      },
    };

    const brushRange = brushLegendRange({
      scaleKey: 'fill',
      legend: manualSeqLegend,
      onEdited: opts.onSelect,
    });

    return {
      interactions: interactions(selectionService, opts, context),
      scales,
      components: opts.pluginService.extendComponents([manualSeqLegend, brushRange, disclaimer].filter(Boolean)),
      palettes: opts.colorService.getPalettes(),
      strategy: (() => {
        const s = dockLayout(patchedLegendLayout, opts);
        if (alwaysShow) applyAlwaysShow(s, opts.chart); // Fix #1
        return s;
      })(),
    };
  }

  // Build legend config
  const legendConfig = {
    eventName: 'legend',
    key: 'legend',
    viewState: opts.viewState,
    chart: opts.chart,
    styleReference: 'object.pieChart',
    styleOverrides: {
      title: opts.styleService.legend.title.getStyle(),
      label: opts.styleService.legend.label.getStyle(),
    },
    rtl: context.rtl,
  };

  // Apply symbol shape for categorical coloring
  const colorSettings = opts.colorService.getSettings();
  if (colorSettings.type === 'categorical' && layout.dataPoint?.symbol) {
    legendConfig.settings = {
      item: {
        shape: {
          type: layout.dataPoint.symbol,
        },
      },
    };
  }

  const leg = opts.colorService.getLegend(legendConfig, { navigationDisabled });

  // When responsive === 'always', prevent picasso from ever removing the legend:
  // 1. minimumLayoutMode 'SPARK' disables the layout-mode threshold check.
  // 2. The strategy's center ratio is forced to 0 so the dock algorithm never
  //    decides there is insufficient space and drops the component.
  if (alwaysShow) {
    leg.components.forEach((c) => {
      if (c.layout) {
        c.layout.minimumLayoutMode = 'SPARK';
      }
    });
  }

  // Invert range scale for left/right docked sequential legends
  if (
    scales.fillRange &&
    leg.components[0] &&
    (leg.components[0].layout.dock === 'right' || leg.components[0].layout.dock === 'left' || context.rtl)
  ) {
    scales.fillRange.invert = true;
  }

  const components = [
    ...leg.components,
    brushLegendRange({ // Fix #3: removed stale `settings` argument
      scaleKey: 'fill',
      legend: leg.components[0] || {},
      onEdited: opts.onSelect,
    }),
    disclaimer,
  ].filter(Boolean);

  return {
    interactions: interactions(selectionService, opts, context),
    scales,
    components: opts.pluginService.extendComponents(components),
    palettes: opts.colorService.getPalettes(),
    strategy: (() => {
      const s = dockLayout(patchedLegendLayout, opts);
      if (alwaysShow) applyAlwaysShow(s, opts.chart); // Fix #1
      return s;
    })(),
  };
}
