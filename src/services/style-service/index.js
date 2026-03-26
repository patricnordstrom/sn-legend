export default function createStyleService({ layout, themeService, colorService }) {
  const styles = themeService.getStyles();

  const overrides = (key) => layout.components?.find((c) => c.key === key);

  const getResolvedColor = (colorObject, defaultColor) => {
    const resolveUIColor = colorService.getPaletteColor;
    if (colorObject?.color && resolveUIColor) {
      const uiColor = resolveUIColor(colorObject);
      if (uiColor === 'none' && colorObject.index > 0) {
        return colorObject?.color ?? defaultColor;
      }
      return uiColor ?? defaultColor;
    }
    return defaultColor;
  };

  return {
    legend: {
      title: {
        getStyle: () => {
          const legendTitle = overrides('legend')?.legend?.title;
          return {
            fontFamily: legendTitle?.fontFamily ?? styles.legend.title.fontFamily,
            fontSize: legendTitle?.fontSize ?? styles.legend.title.fontSize,
            color: getResolvedColor(legendTitle?.color, styles.legend.title.color),
          };
        },
      },
      label: {
        getStyle: () => {
          const legendLabel = overrides('legend')?.legend?.label;
          return {
            fontFamily: legendLabel?.fontFamily ?? styles.legend.label.fontFamily,
            fontSize: legendLabel?.fontSize ?? styles.legend.label.fontSize,
            color: getResolvedColor(legendLabel?.color, styles.legend.label.color),
          };
        },
      },
    },
  };
}
