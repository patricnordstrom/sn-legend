import brushRange from '../brush-legend-range';

describe('brush-legend-range', () => {
  let input;

  beforeEach(() => {
    input = {
      scaleKey: 'fill',
      legend: {
        layout: { dock: 'right' },
      },
    };
  });

  it('should return type brush-range with key legendRangeBrush', () => {
    const def = brushRange(input);
    expect(def.type).to.equal('brush-range');
    expect(def.key).to.equal('legendRangeBrush');
  });

  it('should set scale to scaleKey + "Range"', () => {
    const def = brushRange(input);
    expect(def.settings.scale).to.equal('fillRange');
  });

  it('should use @legend-seq as dock target', () => {
    const def = brushRange(input);
    expect(def.layout.dock).to.equal('@legend-seq');
  });

  describe('direction and bubble alignment', () => {
    it('dock left: vertical direction, bubbles aligned end', () => {
      input.legend.layout.dock = 'left';
      const def = brushRange(input);
      expect(def.settings.direction).to.equal('vertical');
      expect(def.settings.bubbles.align).to.equal('end');
    });

    it('dock right: vertical direction, bubbles aligned start', () => {
      input.legend.layout.dock = 'right';
      const def = brushRange(input);
      expect(def.settings.direction).to.equal('vertical');
      expect(def.settings.bubbles.align).to.equal('start');
    });

    it('dock top: horizontal direction, bubbles aligned end', () => {
      input.legend.layout.dock = 'top';
      const def = brushRange(input);
      expect(def.settings.direction).to.equal('horizontal');
      expect(def.settings.bubbles.align).to.equal('end');
    });

    it('dock bottom: horizontal direction, bubbles aligned start', () => {
      input.legend.layout.dock = 'bottom';
      const def = brushRange(input);
      expect(def.settings.direction).to.equal('horizontal');
      expect(def.settings.bubbles.align).to.equal('start');
    });
  });

  describe('onEdited callback', () => {
    it('should call onEdited when bubbleEnd fires', () => {
      const onEdited = sinon.spy();
      const def = brushRange({ ...input, onEdited });
      def.on.bubbleEnd();
      expect(onEdited).to.have.been.calledOnce;
    });

    it('should have empty on object when onEdited is not provided', () => {
      const def = brushRange(input);
      expect(def.on).to.deep.equal({});
    });
  });
});
