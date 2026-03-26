export default function create(opts, context) {
  const disclaimer = opts.disclaimerService.getDisclaimer();

  if (!disclaimer) {
    return false;
  }

  const { rtl } = context;
  const { translator } = opts;

  const { fontFamily } = opts.themeService.getStyles();

  return {
    key: 'disclaimer',
    type: 'disclaimer',
    renderer: 'react-qcm',
    layout: {
      dock: disclaimer.alignment,
    },
    settings: {
      isRTL: rtl,
      label: translator.get(`Object.Disclaimer.${disclaimer.key}`),
    },
    style: {
      fontFamily,
    },
  };
}
