import {
  useElement,
  useEffect,
  useState,
  useSelections,
  useOptions,
  useLayout,
} from '@nebula.js/stardust';

import {
  storage as viewStateFn,
  cache as viewCacheFn,
  selectionService as createSelectionService,
} from 'qlik-chart-modules';

import actions from '../actions';

export default function initiate({ picasso }) {
  const options = useOptions();
  const element = useElement();
  const selections = useSelections();
  const [instance, setInstance] = useState();
  const interactions = actions();
  const layout = useLayout();

  useEffect(() => {
    element.style.overflow = 'hidden';
    const myPicasso = picasso({
      renderer: { prio: [options.renderer || 'canvas'] },
    });
    const chart = myPicasso.chart({
      element,
      data: [],
      settings: {},
    });

    const selectionService = createSelectionService({
      chart,
      actions: interactions,
      selections,
      config: { selectionActions: false },
    });

    selectionService.setLayout(layout);

    selectionService.setBrushAliases({ colorField: 'qDimensionInfo/0/qAttrDimInfo/0' });

    const vs = viewStateFn({
      legendScrollOffset: 0,
    });

    const viewCache = viewCacheFn();

    interactions.on('selections-start', () => {
      chart.brush('selection').start();
    });

    setInstance({
      picasso: myPicasso,
      chart,
      selectionService,
      viewState: vs,
      viewCache,
      interactions,
    });

    return () => {
      selectionService.destroy();
      chart.destroy();
      interactions.removeAllListeners();
      delete interactions.select;
    };
  }, []);

  return instance;
}
