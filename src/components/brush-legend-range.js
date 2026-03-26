export default function legendRangeBrush({ scaleKey, legend, onEdited }) {
  const { layout } = legend;
  const { dock } = layout || {};

  return {
    type: 'brush-range',
    key: 'legendRangeBrush',
    layout: {
      dock: '@legend-seq',
    },
    on: onEdited
      ? {
          bubbleEnd() {
            onEdited();
          },
        }
      : {},
    settings: {
      brush: 'selection',
      scale: `${scaleKey}Range`,
      direction: dock === 'left' || dock === 'right' ? 'vertical' : 'horizontal',
      bubbles: {
        align: dock === 'left' || dock === 'top' ? 'end' : 'start',
        placement: 'outside',
      },
      target: {
        selector: '[id="legend-seq-target"]',
        fillSelector: '[id="legend-seq-ticks"]',
        fill: 'rgba(82,204,82,0.2)',
      },
    },
  };
}
