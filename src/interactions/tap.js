import { eventToLocalPoint } from '../shared/utils';

const tap = (opts, isSingleSelection, { requireFailure, recognizeWith } = {}) => ({
  type: 'Tap',
  requireFailure,
  recognizeWith,
  options: {
    event: 'tap',
    interval: 10,
    pointers: 1,
    enable(r, e) {
      if (!e) {
        return true;
      }

      if (opts.constraints.select || opts.constraints.active) {
        return false;
      }

      this.components = this.chart
        .componentsFromPoint({ x: e.center.x, y: e.center.y })
        .filter((c) => c.key === 'legend-cat');

      return this.components.length;
    },
  },
  events: {
    tap(e) {
      e.preventDefault();
      const { target } = e.srcEvent;
      if (target && (target.nodeName === 'INPUT' || target.hasAttribute('data-other-value'))) {
        this.chart.component('legendRangeBrush').emit('bubbleStart', e);
        return;
      }
      if (target && target.hasAttribute('data-action') && target.hasAttribute('data-component-key')) {
        this.chart.component(target.getAttribute('data-component-key')).emit(target.getAttribute('data-action'));
        return;
      }
      if (
        target &&
        target.children &&
        target.children[0] &&
        target.children[0].getAttribute('data-component-key') === 'legend-cat'
      ) {
        return;
      }
      if (opts.isLocked(this.components)) {
        return;
      }

      opts.interactions.emit('selections-start');
      const pt = eventToLocalPoint(e, this.chart);
      const s = {
        cx: pt.x,
        cy: pt.y,
        r: 5,
      };

      const shapes = this.chart.shapesAt(s, {
        components: [{ key: 'legend-cat', propagation: 'stop' }],
        propagation: 'stop',
      });

      if (shapes.length) {
        this.chart.brushFromShapes(shapes, {
          components: [
            {
              key: shapes[0].key,
              action: e.srcEvent.ctrlKey || isSingleSelection ? 'set' : e.srcEvent.shiftKey ? 'add' : 'toggle',
              contexts: ['selection'],
            },
          ],
        });
        opts.onSelect();
      }
    },
  },
});

export default tap;
