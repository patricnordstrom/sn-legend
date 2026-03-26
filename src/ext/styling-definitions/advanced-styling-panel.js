import { fontResolver as createFontResolver } from 'qlik-chart-modules';
import labelStylingDefinition from './styling-utils';

const stylingPanelDefinition = (bkgOptionsEnabled, flags, translator, theme) => {
  const fontResolver = createFontResolver({
    theme,
    translator,
    flags,
    config: {
      id: 'pieChart',
      paths: ['legend.title', 'legend.label'],
    },
  });

  return {
    component: 'styling-panel',
    chartTitle: 'Legend chart',
    translation: 'LayerStyleEditor.component.styling',
    subtitle: 'LayerStyleEditor.component.styling',
    useGeneral: true,
    useBackground: bkgOptionsEnabled,
    items: {
      legendTitleSection: {
        translation: 'properties.legend.title',
        component: 'panel-section',
        items: {
          legendTitleItems: {
            component: 'items',
            ref: 'components',
            key: 'legend',
            items: labelStylingDefinition('legend.title', fontResolver, theme),
          },
        },
      },
      legendLabelSection: {
        translation: 'properties.legend.label',
        component: 'panel-section',
        items: {
          legendLabelItems: {
            component: 'items',
            ref: 'components',
            key: 'legend',
            items: labelStylingDefinition('legend.label', fontResolver, theme),
          },
        },
      },
    },
  };
};

export default stylingPanelDefinition;
