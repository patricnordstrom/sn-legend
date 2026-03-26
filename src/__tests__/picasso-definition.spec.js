jest.mock('@qlik/chart-commons', () => ({
  dockLayout: jest.fn(),
}));

import { dockLayout } from '@qlik/chart-commons';
import * as brushLegendRangeModule from '../components/brush-legend-range';
import * as interactionsModule from '../interactions';
import * as disclaimerModule from '../components/disclaimer';
import picassoDefinition from '../picasso-definition';

describe('picassoDefinition', () => {
  let sandbox;
  let layout;
  let context;
  let selectionService;
  let opts;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    dockLayout.mockReturnValue({ size: {}, center: {} });
    sandbox.stub(brushLegendRangeModule, 'default').returns({ type: 'brush-range', key: 'legendRangeBrush' });
    sandbox.stub(interactionsModule, 'default').returns([]);
    sandbox.stub(disclaimerModule, 'default').returns(null);

    layout = {
      legend: { dock: 'left', responsive: 'auto', showTitle: true },
      color: { mode: 'byDimension', auto: false },
      qHyperCube: {
        qDimensionInfo: [{ qFallbackTitle: 'My Dimension' }],
        qMeasureInfo: [{ qFallbackTitle: 'My Measure' }],
      },
      dataPoint: {},
    };

    context = {
      constraints: { select: false, active: false },
      rtl: false,
    };

    selectionService = { getIsSingleSelect: sinon.stub().returns(false) };

    opts = {
      colorService: {
        getScales: sinon.stub().returns({ fill: {} }),
        getLegend: sinon.stub().returns({ components: [{ layout: { dock: 'left' }, key: 'legend' }] }),
        getPalettes: sinon.stub().returns([]),
        getSettings: sinon.stub().returns({ type: 'categorical' }),
      },
      disclaimerService: {
        getHasSuppressingDisclaimer: sinon.stub().returns(false),
      },
      pluginService: {
        extendComponents: sinon.stub().callsFake((c) => c),
      },
      styleService: {
        legend: {
          title: { getStyle: sinon.stub().returns({ color: '#333', fontSize: '14px', fontFamily: 'Arial' }) },
          label: { getStyle: sinon.stub().returns({ color: '#666', fontSize: '12px', fontFamily: 'Arial' }) },
        },
      },
      viewState: {},
      chart: {
        element: { clientWidth: 800, clientHeight: 400 },
      },
      onSelect: sinon.stub(),
    };
  });

  afterEach(() => {
    sandbox.restore();
    dockLayout.mockReset();
  });

  const create = () => picassoDefinition({ layout, context, selectionService }, opts);

  describe('suppressing disclaimer', () => {
    it('returns only the disclaimer component when suppression is active', () => {
      opts.disclaimerService.getHasSuppressingDisclaimer.returns(true);
      const def = create();
      expect(def).to.have.all.keys(['components']);
      expect(disclaimerModule.default).to.have.been.called;
    });
  });

  describe('byExpression + expressionTarget "off"', () => {
    beforeEach(() => {
      layout.color.mode = 'byExpression';
      layout.legend.expressionTarget = 'off';
    });

    it('returns a definition without building a legend', () => {
      const def = create();
      expect(def).to.have.all.keys(['interactions', 'scales', 'components', 'palettes', 'strategy']);
    });

    it('does not call getLegend', () => {
      create();
      expect(opts.colorService.getLegend).to.not.have.been.called;
    });
  });

  describe('byExpression + expressionTarget "dimension" (categorical legend)', () => {
    beforeEach(() => {
      layout.color.mode = 'byExpression';
      layout.legend.expressionTarget = 'dimension';
    });

    it('returns a definition with the expected top-level keys', () => {
      expect(create()).to.have.all.keys(['interactions', 'scales', 'components', 'palettes', 'strategy']);
    });

    it('builds the legend-cat manually — does not call getLegend', () => {
      create();
      expect(opts.colorService.getLegend).to.not.have.been.called;
    });

    it('adds a legendExprFill scale with extract from qDimensionInfo/0', () => {
      const def = create();
      expect(def.scales.legendExprFill).to.be.an('object');
      expect(def.scales.legendExprFill.data.extract.field).to.equal('qDimensionInfo/0');
    });

    it('passes components through pluginService.extendComponents', () => {
      create();
      expect(opts.pluginService.extendComponents).to.have.been.called;
    });

    describe('exprColor.value color parser', () => {
      let getValue;

      beforeEach(() => {
        const def = create();
        getValue = def.scales.legendExprFill.data.extract.props.exprColor.value;
      });

      it('parses ARGB(A,R,G,B) format from ColorMix2', () => {
        expect(getValue({ qAttrExps: { qValues: [{ qText: 'ARGB(255,255,105,0)' }] } })).to.equal(
          'rgba(255,105,0,1.000)',
        );
      });

      it('parses ARGB with partial alpha', () => {
        expect(getValue({ qAttrExps: { qValues: [{ qText: 'ARGB(128,0,255,0)' }] } })).to.equal(
          'rgba(0,255,0,0.502)',
        );
      });

      it('parses RGB(R,G,B) format', () => {
        expect(getValue({ qAttrExps: { qValues: [{ qText: 'RGB(0,128,255)' }] } })).to.equal('rgb(0,128,255)');
      });

      it('returns CSS hex string as-is', () => {
        expect(getValue({ qAttrExps: { qValues: [{ qText: '#ff6600' }] } })).to.equal('#ff6600');
      });

      it('returns null when no qAttrExps', () => {
        expect(getValue({})).to.be.null;
      });

      it('falls back to packed qNum when qText is absent', () => {
        // 0xFF8000 → rgb(255,128,0)
        expect(getValue({ qAttrExps: { qValues: [{ qNum: 0xff8000 }] } })).to.equal('rgb(255,128,0)');
      });
    });

    describe('legend-cat title', () => {
      it('shows dimension title text when showTitle is true', () => {
        create();
        const legendCat = opts.pluginService.extendComponents.args[0][0].find((c) => c.type === 'legend-cat');
        expect(legendCat.settings.title.show).to.be.true;
        expect(legendCat.settings.title.text).to.equal('My Dimension');
      });

      it('hides title when legend.showTitle is false', () => {
        layout.legend.showTitle = false;
        create();
        const legendCat = opts.pluginService.extendComponents.args[0][0].find((c) => c.type === 'legend-cat');
        expect(legendCat.settings.title.show).to.be.false;
      });
    });
  });

  describe('byExpression + expressionTarget "measure" (sequential legend)', () => {
    beforeEach(() => {
      layout.color.mode = 'byExpression';
      layout.legend.expressionTarget = 'measure';
    });

    it('returns a definition with the expected top-level keys', () => {
      expect(create()).to.have.all.keys(['interactions', 'scales', 'components', 'palettes', 'strategy']);
    });

    it('creates a sequential-color fill scale', () => {
      expect(create().scales.fill.type).to.equal('sequential-color');
    });

    it('creates a fillRange scale with extract from qMeasureInfo/0', () => {
      const def = create();
      expect(def.scales.fillRange).to.be.an('object');
      expect(def.scales.fillRange.data.extract.field).to.equal('qMeasureInfo/0');
    });

    it('inverts fillRange for left dock', () => {
      layout.legend.dock = 'left';
      expect(create().scales.fillRange.invert).to.be.true;
    });

    it('inverts fillRange for right dock', () => {
      layout.legend.dock = 'right';
      expect(create().scales.fillRange.invert).to.be.true;
    });

    it('does not invert fillRange for top dock', () => {
      layout.legend.dock = 'top';
      expect(create().scales.fillRange.invert).to.not.be.true;
    });

    describe('fill scale range() function', () => {
      let rangeFn;

      beforeEach(() => {
        rangeFn = create().scales.fill.range;
      });

      it('returns colors sorted by item value', () => {
        const items = [
          { value: 3, exprColor: { value: 'red' } },
          { value: 1, exprColor: { value: 'blue' } },
          { value: 2, exprColor: { value: 'green' } },
        ];
        expect(rangeFn({ data: { items } })).to.deep.equal(['blue', 'green', 'red']);
      });

      it('returns fallback when no items', () => {
        expect(rangeFn({ data: { items: [] } })).to.deep.equal(['#cccccc', '#cccccc']);
      });

      it('returns same color twice for a single item', () => {
        const items = [{ value: 1, exprColor: { value: 'orange' } }];
        expect(rangeFn({ data: { items } })).to.deep.equal(['orange', 'orange']);
      });

      it('filters items with null exprColor', () => {
        const items = [
          { value: 1, exprColor: { value: null } },
          { value: 2, exprColor: { value: 'purple' } },
        ];
        expect(rangeFn({ data: { items } })).to.deep.equal(['purple', 'purple']);
      });
    });

    describe('fill scale domain() function', () => {
      let domainFn;

      beforeEach(() => {
        domainFn = create().scales.fill.domain;
      });

      it('returns values sorted ascending', () => {
        const items = [
          { value: 30, exprColor: { value: 'red' } },
          { value: 10, exprColor: { value: 'blue' } },
          { value: 20, exprColor: { value: 'green' } },
        ];
        expect(domainFn({ data: { items } })).to.deep.equal([10, 20, 30]);
      });

      it('returns [0, 1] fallback when no items', () => {
        expect(domainFn({ data: { items: [] } })).to.deep.equal([0, 1]);
      });

      it('returns same value twice for a single item', () => {
        expect(domainFn({ data: { items: [{ value: 42 }] } })).to.deep.equal([42, 42]);
      });

      it('filters out NaN values', () => {
        const items = [{ value: NaN }, { value: 5 }];
        expect(domainFn({ data: { items } })).to.deep.equal([5, 5]);
      });
    });
  });

  describe('standard path (byDimension / byMeasure)', () => {
    it('calls getLegend with key "legend" and styleOverrides', () => {
      create();
      expect(opts.colorService.getLegend).to.have.been.called;
      const [legendConfig] = opts.colorService.getLegend.args[0];
      expect(legendConfig.key).to.equal('legend');
      expect(legendConfig.styleOverrides).to.be.an('object');
      expect(legendConfig.styleOverrides).to.have.keys(['title', 'label']);
    });

    it('includes brushLegendRange component', () => {
      create();
      expect(brushLegendRangeModule.default).to.have.been.called;
    });

    it('passes navigationDisabled false when responsive is always', () => {
      layout.legend.responsive = 'always';
      create();
      const [, { navigationDisabled }] = opts.colorService.getLegend.args[0];
      expect(navigationDisabled).to.be.false;
    });

    it('passes navigationDisabled true when constraints.select is set', () => {
      context.constraints.select = true;
      create();
      const [, { navigationDisabled }] = opts.colorService.getLegend.args[0];
      expect(navigationDisabled).to.be.true;
    });

    it('applies categorical symbol shape when colorSettings type is categorical', () => {
      layout.dataPoint.symbol = 'circle';
      opts.colorService.getSettings.returns({ type: 'categorical' });
      create();
      const [legendConfig] = opts.colorService.getLegend.args[0];
      expect(legendConfig.settings.item.shape.type).to.equal('circle');
    });

    it('does not set symbol settings for non-categorical color types', () => {
      layout.dataPoint.symbol = 'circle';
      opts.colorService.getSettings.returns({ type: 'measure' });
      create();
      const [legendConfig] = opts.colorService.getLegend.args[0];
      expect(legendConfig.settings).to.be.undefined;
    });

    it('inverts fillRange scale for left dock when present', () => {
      opts.colorService.getScales.returns({ fill: {}, fillRange: {} });
      opts.colorService.getLegend.returns({
        components: [{ layout: { dock: 'left' }, key: 'legend' }],
      });
      const def = create();
      expect(def.scales.fillRange.invert).to.be.true;
    });
  });

  describe('dock resolution', () => {
    it('resolves "auto" dock to "top" when element is wider than tall', () => {
      layout.legend.dock = 'auto';
      opts.chart.element = { clientWidth: 800, clientHeight: 400 };
      create();
      const [patchedLayout] = dockLayout.mock.calls[0];
      expect(patchedLayout.legend.dock).to.equal('top');
    });

    it('resolves "auto" dock to "left" when element is taller than wide', () => {
      layout.legend.dock = 'auto';
      opts.chart.element = { clientWidth: 300, clientHeight: 600 };
      create();
      const [patchedLayout] = dockLayout.mock.calls[0];
      expect(patchedLayout.legend.dock).to.equal('left');
    });

    it('passes concrete dock value to dockLayout unchanged', () => {
      layout.legend.dock = 'right';
      create();
      const [patchedLayout] = dockLayout.mock.calls[0];
      expect(patchedLayout.legend.dock).to.equal('right');
    });
  });

  describe('alwaysShow strategy (responsive === "always")', () => {
    it('inflates strategy size to at least 400×300', () => {
      layout.legend.responsive = 'always';
      opts.chart.element = { clientWidth: 200, clientHeight: 150 };
      const strategyObj = { size: {}, center: {} };
      dockLayout.mockReturnValue(strategyObj);
      const def = create();
      expect(def.strategy.size.width).to.be.at.least(400);
      expect(def.strategy.size.height).to.be.at.least(300);
    });

    it('uses physical element dimensions when they exceed the minimum', () => {
      layout.legend.responsive = 'always';
      opts.chart.element = { clientWidth: 1200, clientHeight: 800 };
      const strategyObj = { size: {}, center: {} };
      dockLayout.mockReturnValue(strategyObj);
      const def = create();
      expect(def.strategy.size.width).to.equal(1200);
      expect(def.strategy.size.height).to.equal(800);
    });

    it('zeroes out center min ratios', () => {
      layout.legend.responsive = 'always';
      const strategyObj = { size: {}, center: {} };
      dockLayout.mockReturnValue(strategyObj);
      const def = create();
      expect(def.strategy.center.minWidthRatio).to.equal(0);
      expect(def.strategy.center.minHeightRatio).to.equal(0);
    });
  });
});
