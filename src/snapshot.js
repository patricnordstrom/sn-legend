import { useImperativeHandle, onTakeSnapshot, useElement, useStaleLayout } from '@nebula.js/stardust';

import { getLegendScrollOffset, attachSnapshotMeta } from '@qlik/chart-commons';

import setSnapshotData from './api/set-snapshot-data';

export default function snapshot({ instance, services }) {
  const element = useElement();
  const layout = useStaleLayout();
  onTakeSnapshot((lyt) => {
    // temp - handle retake of snapshot in storytelling when freeresizing - do not copy!
    if (layout.snapshotData && layout.snapshotData.content && layout.snapshotData.content.chartData) {
      return undefined;
    }
    attachSnapshotMeta(lyt, element);

    if (!instance || !services) {
      return undefined;
    }

    return setSnapshotData({
      layout: lyt,
      chart: instance.chart,
      colorService: services.colorService,
      viewState: instance.viewState,
    });
  });

  useImperativeHandle(
    () => ({
      getViewState() {
        return {
          legendScrollOffset: getLegendScrollOffset(instance.chart, 'legend-cat'),
        };
      },
    }),
    [instance]
  );
}
