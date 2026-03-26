/* global jest */
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiSubset from 'chai-subset';
import chaiAsPromised from 'chai-as-promised';

global.jestExpect = global.expect;
global.expect = chai.expect;
global.chai = chai;
global.sinon = sinon;

chai.use(sinonChai);
chai.use(chaiSubset);
chai.use(chaiAsPromised);

jest.mock('@nebula.js/stardust', () => ({
  __esModule: true,
  ...jest.requireActual('@nebula.js/stardust'),
}));
