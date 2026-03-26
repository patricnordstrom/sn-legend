import conversion from 'qlik-object-conversion';
import definition from './property-definition';
import dataDefinition from '../qae/data';

const hasData = (layout) => !!(layout && layout.qHyperCube?.qSize?.qcy > 0);

export default function ext(env) {
  const extObj = {
    definition: definition(env),
    support: {
      snapshot: hasData,
      export: hasData,
      exportData: true,
      sharing: hasData,
      viewData: true,
    },
    importProperties: (exportFormat, initialProperties, extension, hypercubePath) => {
      const layoutService = { layout: { templateId: initialProperties.templateId } };
      extension.mapProperties(layoutService);
      const defaultPropertyValues = {
        defaultDimension: extension.getDefaultDimensionProperties(),
        defaultMeasure: extension.getDefaultMeasureProperties(),
      };
      return conversion.colorChart.importProperties({
        exportFormat,
        initialProperties,
        dataDefinition: dataDefinition(env),
        defaultPropertyValues,
        hypercubePath,
      });
    },
    exportProperties: (propertyTree, hypercubePath, viewDataMode) =>
      conversion.colorChart.exportProperties({ propertyTree, hypercubePath, viewDataMode }),
  };

  return extObj;
}
