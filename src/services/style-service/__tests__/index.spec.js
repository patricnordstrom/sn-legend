import createStyleService from '..';

describe('createStyleService', () => {
  let sandbox;
  let layout;
  let themeService;
  let colorService;
  let styles;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    layout = { components: [] };
    styles = {
      legend: {
        title: { fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#333333' },
        label: { fontFamily: 'Helvetica, sans-serif', fontSize: '12px', color: '#666666' },
      },
    };
    themeService = { getStyles: sandbox.stub().returns(styles) };
    colorService = { getPaletteColor: (colorObj) => colorObj.color };
  });

  afterEach(() => {
    sandbox.restore();
  });

  const create = () => createStyleService({ layout, themeService, colorService });

  it('should return an object', () => {
    expect(create()).to.be.an('object');
  });

  it('should expose only legend property', () => {
    expect(create()).to.have.all.keys(['legend']);
  });

  describe('legend', () => {
    it('should expose title and label', () => {
      expect(create().legend).to.have.all.keys(['title', 'label']);
    });

    describe('title.getStyle', () => {
      it('returns theme defaults when components is empty', () => {
        expect(create().legend.title.getStyle()).to.deep.equal(styles.legend.title);
      });

      it('returns theme defaults when component exists but has no legend.title override', () => {
        layout.components = [{ key: 'legend' }];
        expect(create().legend.title.getStyle()).to.deep.equal(styles.legend.title);
      });

      it('returns overridden fontFamily, fontSize, and color from component', () => {
        layout.components = [
          {
            key: 'legend',
            legend: {
              title: { fontFamily: 'Georgia', fontSize: '18px', color: { color: 'red' } },
            },
          },
        ];
        const { fontFamily, fontSize, color } = create().legend.title.getStyle();
        expect(fontFamily).to.equal('Georgia');
        expect(fontSize).to.equal('18px');
        expect(color).to.equal('red');
      });

      it('uses first matching component when multiple legend entries exist', () => {
        layout.components = [
          {
            key: 'legend',
            legend: { title: { fontSize: '20px' } },
          },
          {
            key: 'legend',
            legend: { title: { fontSize: '99px' } },
          },
        ];
        const { fontSize } = create().legend.title.getStyle();
        expect(fontSize).to.equal('20px');
      });
    });

    describe('label.getStyle', () => {
      it('returns theme defaults when components is empty', () => {
        expect(create().legend.label.getStyle()).to.deep.equal(styles.legend.label);
      });

      it('returns theme defaults when component exists but has no legend.label override', () => {
        layout.components = [{ key: 'legend' }];
        expect(create().legend.label.getStyle()).to.deep.equal(styles.legend.label);
      });

      it('returns overridden fontFamily, fontSize, and color from component', () => {
        layout.components = [
          {
            key: 'legend',
            legend: {
              label: { fontFamily: 'Comic Sans MS', fontSize: '16px', color: { color: 'blue' } },
            },
          },
        ];
        const { fontFamily, fontSize, color } = create().legend.label.getStyle();
        expect(fontFamily).to.equal('Comic Sans MS');
        expect(fontSize).to.equal('16px');
        expect(color).to.equal('blue');
      });
    });
  });
});
