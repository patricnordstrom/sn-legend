import {
  useElement,
  useEffect,
  useState,
  useTranslator,
  useModel,
  useStaleLayout,
  useApp,
  usePlugins,
  useConstraints,
  useOptions,
  useTheme,
  useAppLayout,
} from '@nebula.js/stardust';

import {
  alternativeService as createAlternativeService,
  colorService as createColorService,
  pluginService as createPluginService,
  themeService as createThemeService,
} from 'qlik-chart-modules';

import getPluginArgs from './plugin-service/plugin-args';
import createDisclaimerService from './disclaimer-service';
import createTooltipService from './tooltip-service';
import createStyleService from './style-service';

export default function createServices({ picasso, instance }) {
  const model = useModel();
  const app = useApp();
  const translator = useTranslator();
  const element = useElement();
  const [services, setServices] = useState();
  const layout = useStaleLayout();
  const plugins = usePlugins();
  const constraints = useConstraints();
  const options = useOptions();
  const theme = useTheme();
  const { qLocaleInfo: localeInfo } = useAppLayout();

  useEffect(() => {
    if (!instance) {
      return;
    }

    element.style.overflow = 'hidden';

    const alternativeService = createAlternativeService({
      app,
      translator,
    });

    const colorService = createColorService({
      picasso: instance.picasso,
      model,
      app,
      translator,
      config: {
        auto: false, // prevents default auto() to be called internally
        key: 'fill',
      },
    });

    const pluginService = createPluginService({
      picassoInstance: instance.picasso,
      plugins,
      pluginArgs: getPluginArgs(layout),
    });

    const themeService = createThemeService({
      theme,
      config: {
        id: 'pieChart',
        resolve: [
          ['object', 'legend.title', 'color', '#595959'],
          ['object', 'legend.title', 'fontFamily'],
          ['object', 'legend.title', 'fontSize', '12px'],
          ['object', 'legend.label', 'color', '#595959'],
          ['object', 'legend.label', 'fontFamily'],
          ['object', 'legend.label', 'fontSize', '12px'],
        ],
      },
    });

    const tooltipService = createTooltipService({
      chart: instance.chart,
      translator,
      constraints,
      options,
      themeService,
      colorService,
    });

    const styleService = createStyleService({
      layout,
      themeService,
      colorService,
    });

    const disclaimerService = createDisclaimerService({
      layout,
    });

    setServices({
      alternativeService,
      colorService,
      disclaimerService,
      pluginService,
      themeService,
      tooltipService,
      styleService,
    });
  }, [model, app, instance, layout, translator.language(), constraints, options.direction, theme.name()]);

  return services;
}
