import legendPan from '../legend-pan';
import chartMock from './mocks/chart.mock';
import eventMock from './mocks/hammer-event.mock';

describe('legend-pan', () => {
  let opts;
  let e;
  let instance;
  let context;

  beforeEach(() => {
    context = { chart: chartMock() };
    e = eventMock();
    opts = { constraints: {} };
    instance = legendPan(opts);
  });

  it('should be type Pan with event legendPan', () => {
    expect(instance.type).to.equal('Pan');
    expect(instance.options.event).to.equal('legendPan');
  });

  describe('enable', () => {
    it('returns true when no event argument', () => {
      expect(instance.options.enable()).to.be.true;
    });

    it('returns true when already started', () => {
      context.isStarted = true;
      expect(instance.options.enable.call(context, {}, e)).to.be.true;
    });

    it('returns false when constraints.active is true', () => {
      opts.constraints.active = true;
      expect(instance.options.enable.call(context, {}, e)).to.be.false;
    });

    it('returns true when pointer is over a legend-cat component', () => {
      context.chart.componentsFromPoint.returns([{ type: 'legend-cat' }]);
      expect(instance.options.enable.call(context, {}, e)).to.be.true;
    });

    it('returns false when pointer is not over a legend-cat component', () => {
      context.chart.componentsFromPoint.returns([{ type: 'legend-seq' }]);
      expect(instance.options.enable.call(context, {}, e)).to.be.false;
    });
  });

  describe('events', () => {
    describe('legendPanstart', () => {
      it('emits panstart on each component and sets isStarted', () => {
        const comp = { key: 'legend-cat', emit: sinon.spy() };
        context.chart.componentsFromPoint.returns([comp]);
        instance.events.legendPanstart.call(context, e);
        expect(comp.emit).to.have.been.calledWith('panstart', e);
        expect(context.isStarted).to.be.true;
      });

      it('does not re-emit if already started', () => {
        const comp = { key: 'legend-cat', emit: sinon.spy() };
        context.chart.componentsFromPoint.returns([comp]);
        context.isStarted = true;
        context.components = [];
        instance.events.legendPanstart.call(context, e);
        expect(comp.emit).to.not.have.been.called;
      });
    });

    describe('legendPanmove', () => {
      it('emits panmove on each component', () => {
        const comp = { emit: sinon.spy() };
        context.components = [comp];
        instance.events.legendPanmove.call(context, e);
        expect(comp.emit).to.have.been.calledWith('panmove', e);
      });
    });

    describe('legendPanend', () => {
      it('emits panend on each component and resets isStarted', () => {
        const comp = { emit: sinon.spy() };
        context.components = [comp];
        context.isStarted = true;
        instance.events.legendPanend.call(context, e);
        expect(comp.emit).to.have.been.calledWith('panend', e);
        expect(context.isStarted).to.be.false;
      });
    });
  });
});
