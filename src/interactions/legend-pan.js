const pan = (opts, { requireFailure, recognizeWith } = {}) => ({
  type: 'Pan',
  requireFailure,
  recognizeWith,
  options: {
    event: 'legendPan',
    pointers: 1,
    threshold: 10,
    enable(r, e) {
      if (this.isStarted || !e) {
        return true;
      }

      if (opts.constraints.active) {
        return false;
      }

      return this.chart.componentsFromPoint({ x: e.center.x, y: e.center.y }).some((c) => c.type === 'legend-cat');
    },
  },
  events: {
    legendPanstart(e) {
      e.preventDefault();
      if (!this.isStarted) {
        this.components = this.chart.componentsFromPoint({ x: e.center.x, y: e.center.y });

        this.components.forEach((comp) => {
          comp.emit('panstart', e);
        });

        this.isStarted = true;
      }
    },
    legendPanmove(e) {
      this.components.forEach((comp) => {
        comp.emit('panmove', e);
      });

      e.preventDefault();
    },
    legendPanend(e) {
      e.preventDefault();

      this.components.forEach((comp) => {
        comp.emit('panend', e);
      });

      this.isStarted = false;
    },
  },
});

export default pan;
