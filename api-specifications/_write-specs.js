/* eslint-disable */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname);

const shared = {
  color: {
    description: 'Color settings.\nMost color options for visualizations are set in the color object in the options. You activate custom coloring by setting `"auto": false` which turns off auto-coloring.\nIf `"auto": true`, no other properties need to be defined in the color object.\nNote: Some of the color properties are depending on which theme is currently being used.',
    kind: 'object',
    entries: {
      auto: { description: 'Set to use automatic coloring.\nWhen `"auto": true`, color settings are based on the visualization used and the number of dimensions and measures, that is, the settings are not fixed, but are dependent on the data input.', defaultValue: false, type: 'boolean' },
      autoMinMax: { description: 'Set to false to define custom color range. Custom color range is only applicable when coloring is by measure (`"mode": "byMeasure"`) or by expression (`"mode": "byExpression"`).\nWhen coloring is by expression, `"expressionIsColor": false` must be set for custom color range to work.', defaultValue: true, type: 'boolean' },
      byDimDef: { optional: true, defaultValue: 'undefined', type: '#/definitions/byDimDef' },
      byMeasureDef: { optional: true, defaultValue: 'undefined', type: '#/definitions/byMeasureDef' },
      colorExpression: { description: 'Sets the color expression to be used when `"mode": "byExpression"` is defined.\nMust evaluate to a color code. Supported formats are: `RGB(r,g,b)`, `ARGB(a,r,g,b)` and hex (`#rrggbb`). The packed integer form returned by `ColorMix2()` is also accepted.', optional: true, defaultValue: 'undefined', type: 'string', examples: ['"colorExpression": "=if(sum(Sales)<avg(Total aggr(sum(Sales),Region)),RGB(255,0,0),RGB(0,128,0))"'] },
      dimensionScheme: { description: 'Color scheme when `"mode": "byDimension"` (`"12"` or `"100"` for most themes).', defaultValue: '12', type: 'string' },
      expressionIsColor: { description: 'Always `true` for the legend chart. The color expression must evaluate to a valid color string. This value cannot be changed.', defaultValue: true, type: 'boolean' },
      expressionLabel: { description: 'Label displayed for the color expression in tooltips. Only used if `"expressionIsColor": false`.', defaultValue: '', type: 'string' },
      formatting: { description: 'Color by measure number formatting options.', kind: 'object', entries: {
        isCustomFormatted: { description: 'If true, the client formatting will be toggled off.', optional: true, defaultValue: false, type: 'boolean' },
        numFormatFromTemplate: { description: 'When enabled, the number format to use can be selected from multiple predefined formats based on the desired type (number, date).', optional: true, defaultValue: true, type: 'boolean' }
      }},
      measureMax: { description: 'Set the max value for the color range.\nOnly applicable if `"autoMinMax": false`.', optional: true, defaultValue: 'undefined', type: 'ValueExpression' },
      measureMin: { description: 'Set the min value for the color range.\nOnly applicable if `"autoMinMax": false`.', optional: true, defaultValue: 'undefined', type: 'ValueExpression' },
      measureScheme: { description: 'Color scheme when `"mode": "byMeasure"`. Can be one of:\n* `sg`: (sequential gradient) the transition between the different color groups is made using different shades of colors. High measure values have darker hues.\n* `sc`: (sequential classes) the transition between the different color groups is made using distinctly different colors.\n* `dg`: (diverging gradient) used when working with data that is ordered from low to high. Low and high values have dark colors, mid-range colors are light.\n* `dc`: (diverging classes) two sequential classes combined, with the mid-range shared. The two extremes are emphasized with dark colors with contrasting hues.', defaultValue: 'sg', kind: 'union', items: [{kind:'literal',value:"'sg'"},{kind:'literal',value:"'sc'"},{kind:'literal',value:"'dg'"},{kind:'literal',value:"'dc'"}] },
      mode: { description: 'Sets the coloring mode for the visualization when auto-coloring has been switched off (`"auto": false`). Can be one of:\n* `primary`: a single color (by default blue) is used for all legend items.\n* `byDimension`: coloring is based on the dimension values. Each value receives a distinct palette color.\n* `byExpression`: coloring is based on a color expression. The legend type is controlled by `legend.expressionTarget`.\n* `byMeasure`: coloring is based on the measure value, producing a sequential gradient legend. Requires a measure.', defaultValue: 'byDimension', kind: 'union', items: [{kind:'literal',value:"'primary'"},{kind:'literal',value:"'byDimension'"},{kind:'literal',value:"'byExpression'"},{kind:'literal',value:"'byMeasure'"}] },
      paletteColor: { description: 'The paletteColor object is used to define the color when you color by single color (`"mode": "primary"`).', defaultValue: '{ index: 6 }', type: '#/definitions/paletteColor' },
      persistent: { description: 'Set to use persistent colors on dimension values between selections. When `true`, dimension values always receive the same color even after filtering. Only applicable when `"mode": "byDimension"`.', defaultValue: true, type: 'boolean' },
      reverseScheme: { description: 'Set to reverse the color scheme.', defaultValue: false, type: 'boolean' },
      useBaseColors: { description: 'Use colors encoded in master items.\nSet to `"dimension"` to inherit colors defined on master dimension items.', defaultValue: 'off', kind: 'union', items: [{kind:'literal',value:"'off'"},{kind:'literal',value:"'dimension'"}] },
      useDimColVal: { description: 'Set to `true` if you want to apply the colors defined for library dimensions when used.\nOnly applicable if `"mode": "byDimension"`.', defaultValue: true, type: 'boolean' },
      useMeasureGradient: { description: 'Set to `true` if you want to apply a gradient for the measure color scale. Only applicable if `"mode": "byMeasure"`.', defaultValue: true, type: 'boolean' }
    }
  }
};

const sharedDefs = {
  AttributeDimensionProperties: { description: 'Extends `NxAttrDimDef`, see Engine API: `NxAttrDimDef`.', extends: [{type:'NxAttrDimDef'}], kind: 'object', entries: { id: { description: 'One of: `colorByAlternative`: provides dimension-value-level color look-up for `color.mode="byDimension"`.', type: 'string' } } },
  AttributeExpressionProperties: { description: 'Extends `NxAttrExprDef`, see Engine API: `NxAttrExprDef`.', extends: [{type:'NxAttrExprDef'}], kind: 'object', entries: { id: { description: 'One of: `colorByExpression` (used with `color.mode="byExpression"`). Written automatically from `color.colorExpression` by the property panel on every change.', type: 'string' } } },
  byDimDef: { description: 'Settings when coloring by dimension (`"mode": "byDimension"`).', kind: 'object', entries: { activeDimensionIndex: { description: 'Index of the dimension used for coloring. Always `0` for the legend chart which has a single dimension.', defaultValue: 0, type: 'number' } } },
  byMeasureDef: { description: 'Settings when coloring by measure (`"mode": "byMeasure"`).', kind: 'object', entries: { key: { description: 'libraryId if `"type": "libraryItem"`, measure expression if `"type": "expression"`.', type: 'string' }, label: { description: 'Label displayed for coloring. String or expression. Not used when coloring by library items.', type: 'string' }, type: { kind: 'union', items: [{kind:'literal',value:"'expression'"},{kind:'literal',value:"'libraryItem'"}] } } },
  FontStyling: { kind: 'object', entries: { color: { type: '#/definitions/paletteColor' }, fontFamily: { type: 'string' }, fontSize: { type: 'string' } } },
  InlineDimensionDef: { description: 'Extends `NxInlineDimensionDef`, see Engine API: `NxInlineDimensionDef`.', extends: [{type:'NxInlineDimensionDef'}], kind: 'object', entries: { autoSort: { description: 'Set to automatically sort the dimension.', optional: true, type: 'boolean' }, cId: { description: 'ID used by Qlik Sense. Must be unique within the current chart.', optional: true, type: 'string' } } },
  InlineMeasureDef: { description: 'Extends `NxInlineMeasureDef`, see Engine API: `NxInlineMeasureDef`.', extends: [{type:'NxInlineMeasureDef'}], kind: 'object', entries: { isCustomFormatted: { description: 'Set to true to toggle off the default client formatting.', type: 'boolean' }, numFormatFromTemplate: { description: 'When enabled, the number format to use can be selected from multiple predefined formats based on the desired type (number, date).', defaultValue: true, type: 'boolean' }, autoSort: { description: 'Set to automatically sort the measure.', optional: true, type: 'boolean' }, cId: { description: 'ID used by Qlik Sense. Must be unique within the current chart.', optional: true, type: 'string' } } },
  Legend: { kind: 'object', entries: { key: { description: 'This should be set to `"legend"` (determines which component the settings apply to).', type: 'string' }, legend: { type: '#/definitions/LegendStyling' } } },
  LegendStyling: { kind: 'object', entries: { label: { type: '#/definitions/LabelNameStyling' }, title: { type: '#/definitions/FontStyling' } } },
  LabelNameStyling: { kind: 'object', entries: { name: { type: '#/definitions/FontStyling' } } },
  MeasureProperties: { description: 'Extends `NxMeasure`, see Engine API: `NxMeasure`.', extends: [{type:'NxMeasure'}], kind: 'object', entries: { qAttributeExpressions: { kind: 'array', items: { type: '#/definitions/AttributeExpressionProperties' } }, qDef: { type: '#/definitions/InlineMeasureDef' } } },
  paletteColor: { description: 'Color information structure. Holds the actual color and index in palette.', kind: 'object', entries: { color: { description: 'Color as hex string (mandatory if `index: -1`).', type: 'string' }, index: { description: 'Index in palette.', type: 'number' } } }
};

// ── properties.json ──────────────────────────────────────────────────────────

const properties = {
  scriptappy: '1.1.3',
  info: {
    name: '@nebula.js/sn-legend:properties',
    description: 'Legend chart generic object definition',
    version: '1.0.0',
    license: 'MIT',
    stability: 'stable',
    'x-qlik-visibility': 'public'
  },
  entries: {
    properties: {
      kind: 'namespace',
      entries: {
        color: shared.color,
        dataPoint: {
          description: 'Data point settings.',
          kind: 'object',
          entries: {
            symbol: {
              description: 'Symbol shape used for legend items when coloring by dimension (`"mode": "byDimension"` and `"auto": false`).\nHas no effect for other color modes.',
              defaultValue: 'square',
              kind: 'union',
              items: [
                { kind: 'literal', value: "'square'" },
                { kind: 'literal', value: "'circle'" },
                { kind: 'literal', value: "'diamond'" },
                { kind: 'literal', value: "'triangle'" },
                { kind: 'literal', value: "'star'" },
                { kind: 'literal', value: "'cross'" },
                { kind: 'literal', value: "'saltire'" }
              ]
            }
          }
        },
        footnote: { description: 'Visualization footnote.', optional: true, defaultValue: '', kind: 'union', items: [{type:'string'},{type:'StringExpression'}] },
        legend: {
          description: 'Legend position and behavior settings.\nBecause the legend is the entire visualization, `legend.show` is always `true` and cannot be toggled.',
          kind: 'object',
          entries: {
            dock: {
              description: 'Sets the legend dock position.\n* `auto`: resolved at render time — `"top"` when the element is wider than it is tall, `"left"` otherwise.\n* `left` / `right`: vertical legend layout.\n* `top` / `bottom`: horizontal legend layout.',
              defaultValue: 'left',
              kind: 'union',
              items: [
                { kind: 'literal', value: "'auto'" },
                { kind: 'literal', value: "'left'" },
                { kind: 'literal', value: "'top'" },
                { kind: 'literal', value: "'right'" },
                { kind: 'literal', value: "'bottom'" }
              ]
            },
            show: { description: 'Always `true`. The legend chart has no center content — the legend is the visualization. This property is hidden in the property panel and cannot be changed.', defaultValue: true, type: 'boolean' },
            showTitle: { description: 'Show the legend title (the dimension field name or custom label).', defaultValue: true, type: 'boolean' },
            responsive: {
              description: 'Controls legend responsiveness.\n* `always`: the legend is always fully visible; navigation arrows never appear regardless of item count.\n* `auto`: the legend paginates when items overflow the available space; navigation arrows appear.',
              defaultValue: 'always',
              kind: 'union',
              items: [
                { kind: 'literal', value: "'always'" },
                { kind: 'literal', value: "'auto'" }
              ]
            },
            expressionTarget: {
              description: 'Controls what the color expression represents when `"color.mode": "byExpression"`. Ignored for all other color modes.\n* `off`: no legend is rendered.\n* `dimension`: categorical legend — the expression returns a distinct color per dimension value.\n* `measure`: sequential gradient legend — the expression returns a numeric color value that maps to a gradient scale.',
              defaultValue: 'off',
              kind: 'union',
              items: [
                { kind: 'literal', value: "'off'" },
                { kind: 'literal', value: "'dimension'" },
                { kind: 'literal', value: "'measure'" }
              ]
            }
          }
        },
        qHyperCubeDef: {
          description: 'Extends `HyperCubeDef`, see Engine API: `HyperCubeDef`.\nThe legend chart requires exactly one dimension and accepts an optional measure (0–1).\nA measure is only needed when `"color.mode": "byMeasure"` or when using `"byExpression"` with the built-in attribute expression mechanism.',
          extends: [{ type: 'HyperCubeDef' }],
          kind: 'object',
          entries: {
            qDimensions: { description: 'Exactly one dimension is required. The dimension values become the legend labels.', kind: 'array', items: { type: '#/definitions/DimensionProperties' } },
            qMeasures: { description: 'Optional — maximum one measure. Required when `"color.mode": "byMeasure"`. Removing the measure automatically resets `color.mode` to `"byDimension"`.', kind: 'array', items: { type: '#/definitions/MeasureProperties' } },
            qInitialDataFetch: { description: 'Initial data page specification. The legend chart fetches up to 500 rows with 2 columns on first load.', defaultValue: '[{ qWidth: 2, qHeight: 500 }]', kind: 'array', items: { type: 'object' } },
            qSuppressMissing: { description: 'Suppress rows where the dimension value is null or missing.', defaultValue: true, type: 'boolean' },
            qSuppressZero: { description: 'Suppress rows where the measure value is zero.', defaultValue: false, type: 'boolean' },
            qMode: { description: 'HyperCube calculation mode. Always `"S"` (standard straight table mode).', defaultValue: 'S', type: 'string' }
          }
        },
        showDetails: { description: 'Show visualization details toggle.', optional: true, defaultValue: true, type: 'boolean' },
        showDisclaimer: { description: 'Show data quality disclaimer messages (for example, when the data set is limited or contains only undefined values).', defaultValue: true, type: 'boolean' },
        showTitles: { description: 'Show title for the visualization.', optional: true, defaultValue: true, type: 'boolean' },
        subtitle: { description: 'Visualization subtitle.', optional: true, defaultValue: '', kind: 'union', items: [{type:'string'},{type:'StringExpression'}] },
        title: { description: 'Visualization title.', optional: true, defaultValue: '', kind: 'union', items: [{type:'string'},{type:'StringExpression'}] },
        version: { description: 'Current version of this generic object definition.', type: 'string' }
      }
    }
  },
  definitions: Object.assign({}, sharedDefs, {
    DimensionProperties: {
      description: 'Extends `NxDimension`, see Engine API: `NxDimension`.',
      extends: [{ type: 'NxDimension' }],
      kind: 'object',
      entries: {
        qAttributeDimensions: {
          description: 'A `colorByAlternative` attribute dimension is added automatically when a dimension is added. Required for `color.mode="byDimension"` to resolve per-value colors.',
          kind: 'array',
          items: { type: '#/definitions/AttributeDimensionProperties' }
        },
        qAttributeExpressions: {
          description: 'A `colorByExpression` attribute expression is kept in sync with `color.colorExpression` automatically when `color.mode="byExpression"`. Do not set this manually.',
          kind: 'array',
          items: { type: '#/definitions/AttributeExpressionProperties' }
        },
        qDef: { type: '#/definitions/InlineDimensionDef' },
        qNullSuppression: { description: 'Suppress null values for this dimension.', optional: true, type: 'boolean' }
      }
    }
  })
};

fs.writeFileSync(path.join(dir, 'properties.json'), JSON.stringify(properties, null, 2));
console.log('properties.json written');

// ── plugins.json ──────────────────────────────────────────────────────────────

const plugins = {
  scriptappy: '1.1.3',
  info: {
    name: '@nebula.js/sn-legend:plugins',
    description: 'Legend chart plugins API definitions',
    version: '1.0.0',
    license: 'MIT',
    stability: 'experimental',
    'x-qlik-visibility': 'public'
  },
  entries: {
    pluginArguments: {
      description: 'The arguments that are passed to the `fn` function of the plugin definition.',
      kind: 'namespace',
      entries: {
        keys: {
          description: 'The keys (references) to different types of chart internals.',
          kind: 'object',
          entries: {
            COMPONENT: {
              description: 'The unique keys of the existing components available in the legend chart.\nUseful if you want to extend or override existing components.',
              kind: 'object',
              entries: {
                LEGEND: { description: 'The categorical legend component (`legend-cat`). Present when `color.mode` is `"byDimension"` or when `color.mode` is `"byExpression"` with `legend.expressionTarget="dimension"`.', defaultValue: 'legend', type: 'string' },
                LEGEND_SEQ: { description: 'The sequential gradient legend component (`legend-seq`). Present when `color.mode` is `"byMeasure"` or when `color.mode` is `"byExpression"` with `legend.expressionTarget="measure"`.', defaultValue: 'legend', type: 'string' },
                BRUSH_LEGEND_RANGE: { description: 'The brush-range interaction overlay for the sequential legend. Enables range selections on the gradient legend.', defaultValue: 'legendRangeBrush', type: 'string' }
              }
            },
            SCALE: {
              description: 'The scales associated with the legend chart.\nUseful if you want to add a component that uses the same scale.',
              kind: 'object',
              entries: {
                FILL: { description: 'The primary fill color scale. For `byDimension` and `byMeasure` modes this is the color service scale. For `byExpression+measure` this is a `sequential-color` scale built from expression values.', defaultValue: 'fill', type: 'string' },
                FILL_RANGE: { description: 'The range scale for the sequential gradient legend. Maps measure values to the gradient extent. Present when `color.mode` is `"byMeasure"` or `"byExpression"` with `legend.expressionTarget="measure"`.', defaultValue: 'fillRange', type: 'string' },
                LEGEND_EXPR_FILL: { description: 'A categorical fill scale built from expression color values. Present when `color.mode` is `"byExpression"` with `legend.expressionTarget="dimension"`. Extracts colors from `qDimensionInfo/0` attribute expressions.', defaultValue: 'legendExprFill', type: 'string' }
              }
            }
          }
        },
        layout: { description: 'The layout from the enigma model.', type: 'object' }
      }
    }
  },
  definitions: {
    getPluginArgs: {
      description: 'Prepare important chart internals for the users to build their own plugins.',
      kind: 'function',
      params: [{ name: 'layoutService', type: 'object' }],
      returns: { description: 'Chart internals that will be exposed to the users.', type: '#/entries/pluginArguments' }
    }
  }
};

fs.writeFileSync(path.join(dir, 'plugins.json'), JSON.stringify(plugins, null, 2));
console.log('plugins.json written');
