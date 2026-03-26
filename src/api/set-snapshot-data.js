/* eslint-disable no-param-reassign */
import { getLegendScrollOffset } from '@qlik/chart-commons';

const KEY = 'legend-cat';

export default function setSnapshotData({ layout, chart, viewState, colorService }) {
  layout.snapshotData.content = layout.snapshotData.content || {};
  layout.snapshotData.content.chartData = {
    legendScrollOffset: getLegendScrollOffset(chart, KEY),
  };

  return colorService
    .getSnapshotData()
    .then((data) => {
      layout.snapshotData.content.chartData = {
        ...layout.snapshotData.content.chartData,
        ...data,
      };
    })
    .catch(() => {});
}
