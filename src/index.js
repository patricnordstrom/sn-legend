import locale from '@qlik/la-vie-locale';
import initiatePicasso from './initiate-picasso';
import initiate from './initiate';
import createServices from './services';
import heavyUpdate from './heavy-update';
import lightUpdate from './light-update';
import snapshot from './snapshot';
import ext from './ext/ext';
import createQae from './qae';

const supernova = (env) => {
  const { flags } = env;
  locale(env.translator);
  const picasso = initiatePicasso();

  return {
    qae: createQae(env),
    ext: ext(env),
    component() {
      const instance = initiate({ picasso });
      const services = createServices({ flags, picasso, instance });

      heavyUpdate({ instance, services, picasso, env });
      lightUpdate({ instance });
      snapshot({ instance, services });
    },
  };
};

export default supernova;
