import { tooltipService } from 'qlik-chart-modules';

export default function createTooltipService({ chart, translator, constraints, options, themeService, colorService }) {
  const rtl = options.direction === 'rtl';
  const { fontFamily } = themeService.getStyles();

  return tooltipService({
    chart,
    translator,
    config: {
      rtl,
      enable: () => !constraints.passive,
      getColorSettings: () => colorService.getSettings(),
      style: {
        fontFamily,
      },
      legend: {
        keys: {
          tooltip: 'legend-color-cat',
          component: 'legend-cat',
        },
      },
    },
  });
}
