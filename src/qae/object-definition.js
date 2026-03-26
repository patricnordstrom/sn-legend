/**
 * @namespace properties
 * @entry
 */
export default function objectDefinition() {
  /**
   * @lends properties
   */
  const properties = {
    /**
     * Current version of this generic object definition
     * @type {string}
     * @default
     */
    version: process.env.PACKAGE_VERSION,
    /**
     * Color settings.
     * @type {object}
     */
    color: {
      auto: false,
      autoMinMax: true,
      byDimDef: { activeDimensionIndex: 0 },
      byMeasureDef: undefined,
      colorExpression: undefined,
      dimensionScheme: '12',
      expressionIsColor: true,
      expressionLabel: '',
      formatting: {
        numFormatFromTemplate: true,
        isCustomFormatted: undefined,
      },
      measureMin: undefined,
      measureMax: undefined,
      measureScheme: 'sg',
      /**
       * Default to byDimension so the legend shows dimensional colors immediately.
       * @type {'primary'|'byDimension'|'byExpression'|'byMeasure'|'byMultiple'}
       * @default "byDimension"
       */
      mode: 'byDimension',
      paletteColor: { index: 6 },
      persistent: true,
      reverseScheme: false,
      singleColor: undefined,
      useBaseColors: 'off',
      useDimColVal: true,
      useMeasureGradient: true,
    },
    /**
     * Data point settings.
     * @type {object}
     */
    dataPoint: {
      /**
       * Symbol shape used for legend items when coloring by dimension.
       * @type {'square'|'circle'|'diamond'|'triangle'|'star'|'cross'|'saltire'}
       * @default "square"
       */
      symbol: 'square',
    },
    /**
     * Visualization footnote.
     * @type {(string|StringExpression)=}
     * @default
     */
    footnote: '',
    /**
     * Legend settings.
     * @type {object}
     */
    legend: {
      /**
       * Sets the legend dock position.
       * @type {'auto'|'right'|'bottom'|'left'|'top'}
       * @default "left"
       */
      dock: 'left',
      /**
       * Set to show the legend. Always true for legend chart.
       * @type {boolean}
       * @default true
       */
      show: true,
      /**
       * Show the legend title.
       * @type {boolean}
       * @default true
       */
      showTitle: true,
      /**
       * Controls legend responsiveness (whether navigation arrows appear).
       * 'always' forces the legend to always be fully visible.
       * 'auto' allows the legend to paginate when space is constrained.
       * @type {'always'|'auto'}
       * @default "always"
       */
      responsive: 'always',
      /**
       * When color.mode === 'byExpression', controls what the expression represents.
       * 'off': do not show legend
       * 'dimension': expression produces categorical colors
       * 'measure': expression produces sequential gradient
       * @type {'off'|'dimension'|'measure'}
       * @default "off"
       */
      expressionTarget: 'off',
    },
    /**
     * Extends `HyperCubeDef`, see Engine API: `HyperCubeDef`.
     * @extends {HyperCubeDef}
     */
    qHyperCubeDef: {
      /** @type {DimensionProperties[]} */
      qDimensions: [],
      /** @type {MeasureProperties[]} */
      qMeasures: [],
      qInitialDataFetch: [{ qWidth: 2, qHeight: 500 }],
      /**
       * @type {boolean}
       * @default
       */
      qSuppressMissing: true,
      /**
       * @type {boolean}
       * @default
       */
      qSuppressZero: false,
      qMode: 'S',
    },
    /**
     * Show visualization details toggle
     * @type {boolean=}
     * @default
     */
    showDetails: true,
    /**
     * Show visualization disclaimer toggle
     * @type {boolean}
     * @default
     */
    showDisclaimer: true,
    /**
     * Show title for the visualization.
     * @type {boolean=}
     * @default
     */
    showTitles: true,
    /**
     * Visualization subtitle.
     * @type {(string|StringExpression)=}
     * @default
     */
    subtitle: '',
    /**
     * Visualization title.
     * @type {(string|StringExpression)=}
     * @default
     */
    title: '',
  };

  return properties;
}
