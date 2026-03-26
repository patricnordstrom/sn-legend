import range from '../range';
import chartMock from './mocks/chart.mock';
import eventMock from './mocks/hammer-event.mock';

describe('range', () => {
  let opts;
  let e;
  let instance;
  let context;

  beforeEach(() => {
    context = { chart: chartMock() };
    e = eventMock();
    opts = {
      onSelect: sinon.stub(),
      constraints: {},
      interactions: { emit: sinon.spy() },
    };
    instance = range(opts);
  });

  it('should be type Pan', () => {
    expect(instance.type).to.equal('Pan');
  });

  describe('enable', () => {
    it('returns true when no event argument', () => {
      expect(instance.options.enable()).to.be.true;
    });

    it('returns true when already started (allows in-progress pan)', () => {
      context.started = true;
      expect(instance.options.enable.call(context, {}, e)).to.be.true;
    });

    it('returns false when constraints.select is true', () => {
      opts.constraints.select = true;
      expect(instance.options.enable.call(context, {}, e)).to.be.false;
    });

    it('returns false when constraints.active is true', () => {
      opts.constraints.active = true;
      expect(instance.options.enable.call(context, {}, e)).to.be.false;
    });

    it('returns true when pointer is over a legend-seq component', () => {
      context.chart.componentsFromPoint.returns([{ type: 'legend-seq' }]);
      expect(instance.options.enable.call(context, {}, e)).to.be.true;
    });

    it('returns false when pointer is not over legend-seq and target has no bubble attributes', () => {
      context.chart.componentsFromPoint.returns([{ type: 'legend-cat' }]);
      expect(instance.options.enable.call(context, {}, e)).to.be.false;
    });

    it('returns true when target has both data-other-value and data-idx attributes (range bubble)', () => {
      const has = sinon.stub();
      has.withArgs('data-other-value').returns(true);
      has.withArgs('data-idx').returns(true);
      e.srcEvent.target = { hasAttribute: has };
      context.chart.componentsFromPoint.returns([]);
      expect(instance.options.enable.call(context, {}, e)).to.be.true;
    });

    it('returns false when target has data-other-value but not data-idx', () => {
      const has = sinon.stub();
      has.withArgs('data-other-value').returns(true);
      has.withArgs('data-idx').returns(false);
      e.srcEvent.target = { hasAttribute: has };
      context.chart.componentsFromPoint.returns([]);
      expect(instance.options.enable.call(context, {}, e)).to.be.false;
    });

    it('returns true when target is an INPUT element', () => {
      e.srcEvent.target = { nodeName: 'INPUT', hasAttribute: sinon.stub().returns(false) };
      context.chart.componentsFromPoint.returns([]);
      expect(instance.options.enable.call(context, {}, e)).to.be.true;
    });

    it('emits rangeClear on legendRangeBrush when not enabled', () => {
      const emit = sinon.spy();
      context.chart.component = sinon.stub().returns({ emit });
      context.chart.componentsFromPoint.returns([{ type: 'legend-cat' }]);
      instance.options.enable.call(context, {}, e);
      expect(context.chart.component).to.have.been.calledWith('legendRangeBrush');
      expect(emit).to.have.been.calledWith('rangeClear');
    });
  });

  describe('events', () => {
    let emit;

    beforeEach(() => {
      emit = sinon.spy();
      context.chart.component = sinon.stub().returns({ emit });
    });

    describe('legendRangestart', () => {
      it('emits rangeStart on legendRangeBrush', () => {
        instance.events.legendRangestart.call(context, e);
        expect(context.chart.component).to.have.been.calledWith('legendRangeBrush');
        expect(emit).to.have.been.calledWith('rangeStart', e);
      });

      it('sets started to true', () => {
        instance.events.legendRangestart.call(context, e);
        expect(context.started).to.be.true;
      });

      it('emits selections-start', () => {
        instance.events.legendRangestart.call(context, e);
        expect(opts.interactions.emit).to.have.been.calledWith('selections-start');
      });
    });

    describe('legendRangemove', () => {
      it('emits rangeMove on legendRangeBrush', () => {
        instance.events.legendRangemove.call(context, e);
        expect(emit).to.have.been.calledWith('rangeMove', e);
      });
    });

    describe('legendRangeend', () => {
      it('emits rangeEnd on legendRangeBrush', () => {
        instance.events.legendRangeend.call(context, e);
        expect(emit).to.have.been.calledWith('rangeEnd', e);
      });

      it('calls onSelect', () => {
        instance.events.legendRangeend.call(context, e);
        expect(opts.onSelect).to.have.been.called;
      });

      it('sets started to false', () => {
        context.started = true;
        instance.events.legendRangeend.call(context, e);
        expect(context.started).to.be.false;
      });
    });
  });
});
