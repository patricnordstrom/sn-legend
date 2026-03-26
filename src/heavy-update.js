import picassoQ from 'picasso-plugin-q';

import {
  useEffect,
  useStaleLayout,
  useAppLayout,
  useSelections,
  useOptions,
  useTheme,
  useConstraints,
  useTranslator,
  useModel,
  useApp,
  usePromise,
} from '@nebula.js/stardust';

import { debouncer } from 'qlik-chart-modules';

import { useLayoutExcludeHash } from '@qlik/hooks';

import picassoDefinition from './picasso-definition';

function setSnapshotViewState(layout, vs) {
  if (layout && layout.snapshotData && layout.snapshotData.content && layout.snapshotData.content.chartData) {
    vs.preventSet('legendScrollOffset', layout.snapshotData.content.chartData.legendScrollOffset);
  }
}

export default function heavyUpdate({ instance, services, picasso, env }) {
  const { flags } = env;
  const options = useOptions();
  const model = useModel();
  const app = useApp();
  const translator = useTranslator();
  const theme = useTheme();
  const layout = useStaleLayout();
  const selections = useSelections();
  const constraints = useConstraints();
  const { qLocaleInfo: localeInfo } = useAppLayout();
  env.localeInfo = localeInfo; // eslint-disable-line no-param-reassign
  const hash = useLayoutExcludeHash({ enable: layout && !layout.snapshotData });

  const [aux] = usePromise(() => {
    if (!services) {
      return Promise.resolve();
    }

    // Map expressionTarget to colorService config
    const createConfig = ({ getUseBaseColors }) => {
      let colorPropsOverride = { ...layout.color };
      if (layout.color?.mode === 'byExpression') {
        // 'off'/'dimension' → expressionIsColor=true (color strings per dimension row)
        // 'measure' → expressionIsColor=false → continuous/sequential gradient legend
        colorPropsOverride.expressionIsColor = layout.legend?.expressionTarget !== 'measure';
      }

      return {
        theme,
        legendProps: layout.legend,
        layout,
        localeInfo,
        hc: layout.qHyperCube,
        colorProps: {
          ...colorPropsOverride,
          useBaseColors: getUseBaseColors(layout),
        },
      };
    };

    return Promise.resolve(model && !layout.snapshotData ? model.getEffectiveProperties() : {}).then(
      async (properties) =>
        Promise.all([
          services.colorService.initialize({ createConfig }),
          Promise.resolve(properties),
          services.pluginService.initialize(),
          services.alternativeService.initialize({ properties }),
        ])
    );
  }, [services, hash]);

  useEffect(() => {
    if (!instance?.selectionService) {
      return;
    }
    instance.selectionService.setLayout(layout);
  }, [layout]);

  useEffect(() => {
    if (!instance || !aux) {
      return;
    }

    const { chart, viewState, interactions, viewCache } = instance;
    const {
      alternativeService,
      colorService,
      disclaimerService,
      pluginService,
      themeService,
      tooltipService,
      styleService,
    } = services;
    const vsOpts = options.viewState || {};

    if (!layout.snapshotData) {
      viewState.preventSet('legendScrollOffset', vsOpts.legendScrollOffset || 0);
    }

    setSnapshotViewState(layout, viewState);

    const ds = picasso.data('q')({
      key: 'qHyperCube',
      data: layout.qHyperCube,
      config: {
        localeInfo,
      },
    });

    const picassoData = [
      {
        type: 'q',
        key: 'qHyperCube',
        data: layout.qHyperCube,
        config: {
          localeInfo,
        },
      },
      ...colorService.getData(),
    ];

    // Legend chart has no measure-based disclaimers — just pass minimal args
    disclaimerService.initialize({
      args: {
        ds,
        encodings: {},
      },
    });

    const onSelect = selections
      ? () => {
          const b = chart.brush('selection');
          const picSelections = picassoQ.selections(b, {}, layout);
          picSelections.forEach((s) => {
            selections.select(s);
          });
        }
      : () => {};

    const logicalSize =
      layout.snapshotData && !options.freeResize
        ? {
            width: (layout.snapshotData.content.size || layout.snapshotData.object.size).w,
            height: (layout.snapshotData.content.size || layout.snapshotData.object.size).h,
          }
        : undefined;

    const isLocked = (components) => instance.selectionService.getIsSelectionLocked(components);

    const generateSettings = () =>
      picassoDefinition(
        {
          layout,
          context: {
            rtl: options.direction === 'rtl',
            theme,
            translator,
            constraints,
            model,
          },
          selectionService: instance.selectionService,
        },
        {
          picasso,
          ds,
          model,
          app,
          chart,
          onSelect,
          isLocked,
          interactions,
          constraints,
          translator,
          viewState,
          alternativeService,
          colorService,
          disclaimerService,
          pluginService,
          themeService,
          styleService,
          tooltipService,
          debouncer,
          properties: aux[1],
          selections,
          logicalSize,
          flags,
          viewCache,
        }
      );

    instance.generateSettings = generateSettings; // eslint-disable-line no-param-reassign
    const settings = generateSettings();

    chart.update({
      data: picassoData,
      settings,
    });

    viewCache.set('chartWidth', chart.element.clientWidth);
    viewCache.set('chartHeight', chart.element.clientHeight);
  }, [instance, aux, options.direction, constraints, theme.name(), translator.language()]);
}
