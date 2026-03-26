import simpleStylingDefinition from './styling-definitions/simple-styling-def';
import stylingPanelDefinition from './styling-definitions/advanced-styling-panel';

// Keep the colorByExpression attribute expression on the dimension in sync with the
// color settings. Called on every property change via globalChange.
function updateColorByExpression(props) {
  (props.qHyperCubeDef?.qDimensions ?? []).forEach((dim) => {
    /* eslint-disable no-param-reassign */
    if (!Array.isArray(dim.qAttributeExpressions)) {
      dim.qAttributeExpressions = [];
    }
    const idx = dim.qAttributeExpressions.findIndex((e) => e.id === 'colorByExpression');
    if (props.color?.mode === 'byExpression' && !props.color?.auto && props.color?.colorExpression) {
      const entry = { qExpression: props.color.colorExpression, id: 'colorByExpression' };
      if (idx === -1) {
        dim.qAttributeExpressions.push(entry);
      } else {
        dim.qAttributeExpressions[idx] = entry;
      }
    } else if (idx !== -1) {
      dim.qAttributeExpressions.splice(idx, 1);
    }
    /* eslint-enable no-param-reassign */
  });
}

const colorModeOptions = (data) => {
  const options = [
    {
      value: 'byDimension',
      translation: 'properties.colorMode.byDimension',
    },
  ];
  const hasMeasure = data.qHyperCubeDef?.qMeasures?.length > 0;
  if (hasMeasure) {
    options.push({
      value: 'byMeasure',
      translation: 'properties.colorMode.byMeasure',
    });
  }
  options.push({
    value: 'byExpression',
    translation: 'properties.colorMode.byExpression',
  });
  return options;
};

function createSettings(env) {
  const { flags, translator } = env || {};
  const theme = env?.sense?.theme;
  const bkgOptionsEnabled = true;

  return {
  uses: 'settings',
  items: {
    simpleStyling: simpleStylingDefinition,
    general: {
      items: {
        showDisclaimer: {
          translation: 'properties.showDisclaimer',
          type: 'boolean',
          ref: 'showDisclaimer',
          component: 'switch',
          defaultValue: true,
          options: [
            {
              value: true,
              translation: 'Common.Show',
            },
            {
              value: false,
              translation: 'properties.hide',
            },
          ],
        },
      },
    },
    presentation: {
      type: 'items',
      translation: 'properties.presentation',
      grouped: true,
      items: {
        legendStyling: stylingPanelDefinition(bkgOptionsEnabled, flags, translator, theme),
        symbol: {
          type: 'string',
          component: 'dropdown',
          ref: 'dataPoint.symbol',
          translation: 'Object.GridChart.Symbol',
          defaultValue: 'square',
          options: [
            { value: 'circle', translation: 'Object.GridChart.Symbol.Circle' },
            { value: 'cross', translation: 'Object.GridChart.Symbol.Cross' },
            { value: 'diamond', translation: 'Object.GridChart.Symbol.Diamond' },
            { value: 'saltire', translation: 'Object.GridChart.Symbol.Saltire' },
            { value: 'square', translation: 'Object.GridChart.Symbol.Square' },
            { value: 'star', translation: 'Object.GridChart.Symbol.Star' },
            { value: 'triangle', translation: 'Object.GridChart.Symbol.Triangle' },
          ],
          show(data) {
            return !data.color?.auto && data.color?.mode === 'byDimension';
          },
        },
      },
    },
    colorsAndLegend: {
      uses: 'colorsAndLegend',
      items: {
        colors: {
          items: {
            colorMode: {
              options: colorModeOptions,
            },
            // Keep the mixin's attributeExpression only when a measure is present.
            // Without a measure it creates a stub qMeasures[0] entry (missing qDef)
            // which crashes the platform's getLabels / cId traversal code.
            attributeExpression: {
              show(data) {
                return (
                  !data.color?.auto &&
                  data.color?.mode === 'byExpression' &&
                  data.qHyperCubeDef?.qMeasures?.length > 0
                );
              },
            },
            // expressionIsColor is always true for the legend chart — hide the interactive
            // checkbox and replace it with a non-interactive text label in its place.
            expressionIsColor: {
              show: () => false,
            },
            expressionIsColorInfo: {
              component: 'text',
              translation: 'properties.color.expressionIsColor',
              show(data) {
                return !data.color?.auto && data.color?.mode === 'byExpression';
              },
            },
          },
        },
        // Standalone expression editor shown when byExpression is active but there is no
        // measure. Writes directly to color.colorExpression; updateColorByExpression
        // (globalChange on legendMode) keeps the dimension qAttributeExpressions in sync.
        colorExpressionNomeasure: {
          type: 'string',
          component: 'expression',
          ref: 'color.colorExpression',
          translation: 'properties.color.colorExpression',
          show(data) {
            return (
              !data.color?.auto &&
              data.color?.mode === 'byExpression' &&
              !(data.qHyperCubeDef?.qMeasures?.length > 0)
            );
          },
        },
        legendMode: {
          type: 'string',
          component: 'dropdown',
          ref: 'legend.expressionTarget',
          translation: 'properties.legend.show',
          defaultValue: 'off',
          options: [
            { value: 'off', translation: 'Common.No' },
            { value: 'dimension', translation: 'Object.LegendChart.ExpressionTarget.Dimension' },
            { value: 'measure', translation: 'Object.LegendChart.ExpressionTarget.Measure' },
          ],
          show(data) {
            return !data.color?.auto && data.color?.mode === 'byExpression';
          },
          globalChange: updateColorByExpression,
        },
        legend: {
          // The mixin hides the whole legend section for byExpression; override at group level
          // so dock/showTitle appear whenever a legend is actually engaged.
          show(data) {
            if (data.color?.auto) return false;
            if (data.color?.mode === 'byExpression') {
              return data.legend?.expressionTarget !== 'off';
            }
            return true;
          },
          items: {
            // legend.show is always true — hide the toggle
            show: {
              show: () => false,
            },
            showTitle: {
              show(data) {
                return !data.color?.auto;
              },
            },
            dock: {
              show(data) {
                return !data.color?.auto;
              },
            },
            responsive: {
              type: 'string',
              component: 'switch',
              ref: 'legend.responsive',
              translation: 'properties.legend.responsive',
              defaultValue: 'always',
              options: [
                { value: 'always', translation: 'Common.AlwaysShow' },
                { value: 'auto', translation: 'Common.Auto' },
              ],
            },
          },
        },
      },
    },
  },
  }; // end return
} // end createSettings

const data = {
  uses: 'data',
  items: {
    dimensions: {
      uses: 'dimensions',
      items: {
        othertotals: null,
        alternativeDimensions: null,
      },
    },
    measures: {
      uses: 'measures',
      items: {
        alternativeMeasures: null,
      },
    },
  },
};

const addons = {
  type: 'items',
  component: 'expandable-items',
  translation: 'properties.addons',
  items: {
    dataHandling: {
      uses: 'dataHandling',
      items: {
        calcCond: {
          uses: 'calcCond',
        },
      },
    },
  },
};

export default function propertyDefinition(env) {
  return {
    type: 'items',
    component: 'accordion',
    items: {
      data,
      sorting: { uses: 'sorting' },
      addons,
      settings: createSettings(env),
    },
  };
}
