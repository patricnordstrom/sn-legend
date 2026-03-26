/* eslint no-param-reassign:0 */

function revertColorModeOnMeasureRemove(props) {
  if (!props.qHyperCubeDef) {
    return;
  }
  const { mode } = props.color;
  if (mode === 'byExpression' || mode === 'byMeasure') {
    props.color.mode = 'byDimension';
  }
}

// byDimension requires a colorByAlternative attribute dimension on each dimension.
// The colorsAndLegend behavior adds this when the user switches color modes, but not
// when the mode is already byDimension at the time the dimension is added.
function ensureColorByAlternative(dimension) {
  if (!Array.isArray(dimension.qAttributeDimensions)) {
    dimension.qAttributeDimensions = [];
  }
  if (!dimension.qAttributeDimensions.some((d) => d.id === 'colorByAlternative')) {
    dimension.qAttributeDimensions.push({
      qDef: dimension.qDef?.qFieldDefs?.[0] || '',
      id: 'colorByAlternative',
    });
  }
}

// byExpression requires a colorByExpression attribute expression on each dimension so
// that the engine evaluates the color expression per row and stores the result in qAttrExps.
function ensureColorByExpression(dimension, props) {
  if (!Array.isArray(dimension.qAttributeExpressions)) {
    dimension.qAttributeExpressions = [];
  }
  const idx = dimension.qAttributeExpressions.findIndex((e) => e.id === 'colorByExpression');
  if (props.color?.mode === 'byExpression' && !props.color?.auto && props.color?.colorExpression) {
    const entry = { qExpression: props.color.colorExpression, id: 'colorByExpression' };
    if (idx === -1) {
      dimension.qAttributeExpressions.push(entry);
    } else {
      dimension.qAttributeExpressions[idx] = entry;
    }
  } else if (idx !== -1) {
    dimension.qAttributeExpressions.splice(idx, 1);
  }
}

function ensureByDimDef(props) {
  if (!props.color) {
    return;
  }
  if (!props.color.byDimDef) {
    props.color.byDimDef = {};
  }
  if (props.color.byDimDef.activeDimensionIndex === undefined) {
    props.color.byDimDef.activeDimensionIndex = 0;
  }
}

export default function data() {
  return {
    dimensions: {
      min: 1,
      max: 1,
      add(dimension, props) {
        ensureColorByAlternative(dimension);
        ensureColorByExpression(dimension, props);
        ensureByDimDef(props);
      },
      replace(dimension, props) {
        ensureColorByAlternative(dimension);
        ensureColorByExpression(dimension, props);
        ensureByDimDef(props);
      },
    },
    measures: {
      min: 0,
      max: 1,
      remove(measure, props) {
        revertColorModeOnMeasureRemove(props);
      },
    },
  };
}
