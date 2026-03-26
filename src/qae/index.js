import conversion from 'qlik-object-conversion';
import objectDefinition from './object-definition';
import dataDefinition from './data';

export default function qae(env) {
  return {
    properties: {
      ...objectDefinition(env),
    },
    data: {
      targets: [dataDefinition(env)],
    },
    importProperties: ({ exportFormat, initialProperties, hypercubePath }) => {
      const propTree = conversion.colorChart.importProperties({
        exportFormat,
        initialProperties,
        dataDefinition: dataDefinition(env),
        hypercubePath,
      });
      return propTree;
    },
    exportProperties: ({ propertyTree, hypercubePath, viewDataMode }) =>
      conversion.colorChart.exportProperties({ propertyTree, hypercubePath, viewDataMode }),
  };
}
