import { useEffect, useStaleLayout, useOptions, useRect } from '@nebula.js/stardust';

export default function lightUpdate({ instance }) {
  const layout = useStaleLayout();
  const options = useOptions();
  const rect = useRect();

  useEffect(() => {
    if (!instance || !instance.generateSettings) {
      return;
    }
    const { viewCache, chart, generateSettings } = instance;
    chart.update({
      settings: generateSettings(),
    });
    viewCache.set('chartWidth', chart.element.clientWidth);
    viewCache.set('chartHeight', chart.element.clientHeight);
  }, [rect.width, rect.height]);
}
