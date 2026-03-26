import Hammer from 'hammerjs';
import picassojs from 'picasso.js';
import picassoQ from 'picasso-plugin-q';
import picassoHammer from 'picasso-plugin-hammer';
// eslint-disable-next-line import/no-unresolved
import { reactRenderer, axisTitleComponent, disclaimerComponent } from 'qlik-chart-modules/react';

export default function initiatePicasso() {
  const picasso = picassojs();
  picasso.use(picassoQ);
  picasso.use(picassoHammer(Hammer));
  picasso.renderer('react-qcm', reactRenderer);
  picasso.component('axis-title', axisTitleComponent);
  picasso.component('disclaimer', disclaimerComponent);

  return picasso;
}
