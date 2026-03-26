import range from './range';
import tap from './tap';
import native from './native';
import legendPan from './legend-pan';

const hammer = (opts, isSingleSelection, tooltipGestures) => ({
  key: 'hammered',
  type: 'hammer',
  enable: true,
  gestures: isSingleSelection
    ? [
        tap(opts, isSingleSelection, {}), // 1-Tap
        ...tooltipGestures,
      ]
    : [
        range(opts, {}), // 1-Pan
        legendPan(opts, {}), // 1-Pan
        tap(opts, isSingleSelection, {}), // 1-Tap
        ...tooltipGestures,
      ],
});

function create(selectionService, opts, context) {
  const isSingleSelection = selectionService.getIsSingleSelect(0);
  const { constraints } = context;
  if (constraints.active && constraints.passive) {
    return [];
  }
  const tooltipInteractions = opts.tooltipService.getInteractions();
  return [hammer(opts, isSingleSelection, tooltipInteractions.gestures), native(opts), tooltipInteractions.native];
}

export default create;
