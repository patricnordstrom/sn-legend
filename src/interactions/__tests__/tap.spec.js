import tap from '../tap';
import chartMock from './mocks/chart.mock';
import eventMock from './mocks/hammer-event.mock';

describe('tap', () => {
  let opts;
  let e;
  let tapInstance;
  let context;

  beforeEach(() => {
    context = { chart: chartMock(), components: [] };
    e = eventMock();
    opts = {
      onSelect: sinon.stub().returns(true),
      isLocked: sinon.stub().returns(false),
      constraints: {},
      interactions: { emit: sinon.spy() },
    };
    tapInstance = tap(opts);
  });

  it('should have correct configuration', () => {
    expect(tapInstance).to.containSubset({
      options: { interval: 10, pointers: 1 },
    });
  });

  describe('enable', () => {
    it('returns true when no event argument', () => {
      expect(tapInstance.options.enable()).to.be.true;
    });

    it('returns false when constraints.select is true', () => {
      opts.constraints.select = true;
      expect(tapInstance.options.enable.call(context, {}, e)).to.be.false;
    });

    it('returns false when constraints.active is true', () => {
      opts.constraints.active = true;
      expect(tapInstance.options.enable.call(context, {}, e)).to.be.false;
    });

    it('filters chart components to legend-cat only and returns the count', () => {
      context.chart.componentsFromPoint.returns([
        { key: 'legend-cat' },
        { key: 'legend-seq' },
        { key: 'other' },
      ]);
      const result = tapInstance.options.enable.call(context, {}, e);
      expect(result).to.equal(1);
      expect(context.components).to.deep.equal([{ key: 'legend-cat' }]);
    });

    it('returns 0 when no legend-cat component is present', () => {
      context.chart.componentsFromPoint.returns([{ key: 'legend-seq' }]);
      expect(tapInstance.options.enable.call(context, {}, e)).to.equal(0);
    });
  });

  describe('events.tap', () => {
    it('emits bubbleStart for INPUT target', () => {
      e.srcEvent.target = { nodeName: 'INPUT' };
      tapInstance.events.tap.call(context, e);
      expect(context.chart.component).to.have.been.calledWith('legendRangeBrush');
      expect(context.chart.component().emit).to.have.been.calledWith('bubbleStart', e);
    });

    it('emits bubbleStart when target has data-other-value attribute', () => {
      const has = sinon.stub();
      has.withArgs('data-other-value').returns(true);
      e.srcEvent.target = { hasAttribute: has, nodeName: 'DIV' };
      tapInstance.events.tap.call(context, e);
      expect(context.chart.component().emit).to.have.been.calledWith('bubbleStart', e);
    });

    it('dispatches component action when target has data-action and data-component-key', () => {
      const has = sinon.stub();
      has.withArgs('data-action').returns(true);
      has.withArgs('data-component-key').returns(true);
      e.srcEvent.target = { hasAttribute: has, getAttribute: (v) => v };
      tapInstance.events.tap.call(context, e);
      expect(context.chart.component).to.have.been.calledWith('data-component-key');
      expect(context.chart.component().emit).to.have.been.calledWith('data-action');
    });

    it('skips selection when first child has data-component-key === legend-cat', () => {
      e.srcEvent.target = {
        hasAttribute: sinon.stub().returns(false),
        children: [{ getAttribute: () => 'legend-cat' }],
      };
      tapInstance.events.tap.call(context, e);
      expect(context.chart.shapesAt).to.not.have.been.called;
    });

    it('skips selection when isLocked returns true', () => {
      opts.isLocked.returns(true);
      tapInstance.events.tap.call(context, e);
      expect(context.chart.shapesAt).to.not.have.been.called;
    });

    it('does not brush when no shapes found', () => {
      context.chart.shapesAt.returns([]);
      tapInstance.events.tap.call(context, e);
      expect(context.chart.brushFromShapes).to.not.have.been.called;
      expect(opts.onSelect).to.not.have.been.called;
    });

    it('toggles selection by default when shape is found', () => {
      const shapes = [{ key: 'legend-cat' }];
      context.chart.shapesAt.returns(shapes);
      tapInstance.events.tap.call(context, e);
      expect(context.chart.brushFromShapes).to.have.been.calledWith(shapes, {
        components: [{ key: 'legend-cat', action: 'toggle', contexts: ['selection'] }],
      });
      expect(opts.onSelect).to.have.been.called;
    });

    it('uses "set" action when ctrlKey is pressed', () => {
      e.srcEvent.ctrlKey = true;
      context.chart.shapesAt.returns([{ key: 'legend-cat' }]);
      tapInstance.events.tap.call(context, e);
      const [, brushOpts] = context.chart.brushFromShapes.args[0];
      expect(brushOpts.components[0].action).to.equal('set');
    });

    it('uses "add" action when shiftKey is pressed', () => {
      e.srcEvent.shiftKey = true;
      context.chart.shapesAt.returns([{ key: 'legend-cat' }]);
      tapInstance.events.tap.call(context, e);
      const [, brushOpts] = context.chart.brushFromShapes.args[0];
      expect(brushOpts.components[0].action).to.equal('add');
    });

    it('uses "set" action in single-selection mode', () => {
      tapInstance = tap(opts, true);
      context.chart.shapesAt.returns([{ key: 'legend-cat' }]);
      tapInstance.events.tap.call(context, e);
      const [, brushOpts] = context.chart.brushFromShapes.args[0];
      expect(brushOpts.components[0].action).to.equal('set');
    });

    it('looks up shapes only in legend-cat component (stop propagation)', () => {
      context.chart.shapesAt.returns([{ key: 'legend-cat' }]);
      tapInstance.events.tap.call(context, e);
      const [, shapesOpts] = context.chart.shapesAt.args[0];
      expect(shapesOpts).to.deep.equal({
        components: [{ key: 'legend-cat', propagation: 'stop' }],
        propagation: 'stop',
      });
    });
  });
});
