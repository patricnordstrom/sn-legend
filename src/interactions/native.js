function doScroll(e, comp) {
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  const dir = delta >= 0 ? 'next' : 'prev';
  comp.emit(dir);
}

export default function native(opts) {
  return {
    type: 'native',
    key: 'theusual',
    events: {
      wheel(e) {
        let doPrevent = false;

        if (!opts.constraints.select && !opts.constraints.active) {
          const comp = this.chart.componentsFromPoint(e).filter((c) => c.key === 'legend-cat')[0];

          if (comp) {
            doPrevent = true;
            doScroll(e, comp);
          }
        }

        if (doPrevent) {
          e.preventDefault();
        }
      },
    },
  };
}
