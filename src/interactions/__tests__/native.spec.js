import native from '../native';
import chartMock from './mocks/chart.mock';

describe('native', () => {
  let opts;
  let context;
  let e;

  beforeEach(() => {
    context = { chart: chartMock() };
    opts = { constraints: {} };
    e = {
      deltaX: 0,
      deltaY: 5,
      preventDefault: sinon.spy(),
    };
  });

  it('should return type native with key theusual', () => {
    const def = native(opts);
    expect(def.type).to.equal('native');
    expect(def.key).to.equal('theusual');
  });

  describe('wheel event', () => {
    it('does nothing when constraints.select is set', () => {
      opts.constraints.select = true;
      const comp = { key: 'legend-cat', emit: sinon.spy() };
      context.chart.componentsFromPoint.returns([comp]);
      native(opts).events.wheel.call(context, e);
      expect(comp.emit).to.not.have.been.called;
      expect(e.preventDefault).to.not.have.been.called;
    });

    it('does nothing when constraints.active is set', () => {
      opts.constraints.active = true;
      const comp = { key: 'legend-cat', emit: sinon.spy() };
      context.chart.componentsFromPoint.returns([comp]);
      native(opts).events.wheel.call(context, e);
      expect(comp.emit).to.not.have.been.called;
    });

    it('does nothing when no legend-cat component is under the pointer', () => {
      context.chart.componentsFromPoint.returns([{ key: 'legend-seq' }]);
      native(opts).events.wheel.call(context, e);
      expect(e.preventDefault).to.not.have.been.called;
    });

    it('emits "next" and prevents default when deltaY is positive', () => {
      const comp = { key: 'legend-cat', emit: sinon.spy() };
      context.chart.componentsFromPoint.returns([comp]);
      e.deltaY = 10;
      native(opts).events.wheel.call(context, e);
      expect(comp.emit).to.have.been.calledWith('next');
      expect(e.preventDefault).to.have.been.called;
    });

    it('emits "prev" when deltaY is negative', () => {
      const comp = { key: 'legend-cat', emit: sinon.spy() };
      context.chart.componentsFromPoint.returns([comp]);
      e.deltaY = -5;
      native(opts).events.wheel.call(context, e);
      expect(comp.emit).to.have.been.calledWith('prev');
    });

    it('uses deltaX when its absolute value exceeds deltaY', () => {
      const comp = { key: 'legend-cat', emit: sinon.spy() };
      context.chart.componentsFromPoint.returns([comp]);
      e.deltaX = -20;
      e.deltaY = 5;
      native(opts).events.wheel.call(context, e);
      expect(comp.emit).to.have.been.calledWith('prev');
    });

    it('uses deltaY when its absolute value exceeds deltaX', () => {
      const comp = { key: 'legend-cat', emit: sinon.spy() };
      context.chart.componentsFromPoint.returns([comp]);
      e.deltaX = 3;
      e.deltaY = 10;
      native(opts).events.wheel.call(context, e);
      expect(comp.emit).to.have.been.calledWith('next');
    });
  });
});
