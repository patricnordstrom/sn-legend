function onBubble(e) {
  const { target } = e.srcEvent;
  if (
    target &&
    ((target.hasAttribute('data-other-value') && target.hasAttribute('data-idx')) || target.nodeName === 'INPUT')
  ) {
    return true;
  }
  return false;
}

const range = (opts, { requireFailure, recognizeWith } = {}) => ({
  type: 'Pan',
  requireFailure,
  recognizeWith,
  options: {
    event: 'legendRange',
    enable(r, e) {
      if (this.started || !e) {
        return true;
      }

      if (opts.constraints.select || opts.constraints.active) {
        return false;
      }

      const isSeq = this.chart
        .componentsFromPoint({ x: e.center.x, y: e.center.y })
        .some((c) => c.type === 'legend-seq');

      const doEnable = isSeq || onBubble(e);
      if (!doEnable) {
        // Clear brush if no longer active (component absent for categorical legends)
        this.chart.component('legendRangeBrush')?.emit('rangeClear');
      }
      return doEnable;
    },
  },
  events: {
    legendRangestart(e) {
      e.preventDefault();
      opts.interactions.emit('selections-start');
      this.chart.component('legendRangeBrush').emit('rangeStart', e);
      this.started = true;
    },
    legendRangemove(e) {
      e.preventDefault();
      this.chart.component('legendRangeBrush').emit('rangeMove', e);
    },
    legendRangeend(e) {
      e.preventDefault();
      this.chart.component('legendRangeBrush').emit('rangeEnd', e);
      opts.onSelect();
      this.started = false;
    },
  },
});

export default range;
