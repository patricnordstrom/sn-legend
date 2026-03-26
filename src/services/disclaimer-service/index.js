import { disclaimerService } from 'qlik-chart-modules';

export default function createDisclaimerService({ layout }) {
  return disclaimerService({
    layout,
    config: {
      args: {},
      disclaimers: {
        NoDataExist: {
          condition: ({ ds }) => {
            const rows = ds.extract({
              field: 'qDimensionInfo/0',
              props: {},
            });
            return rows.length === 0;
          },
        },
      },
    },
  });
}
