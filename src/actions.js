import EventEmitter from 'node-event-emitter';

const mixin = (obj) => {
  /* eslint no-param-reassign: 0 */
  Object.keys(EventEmitter.prototype).forEach((key) => {
    obj[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(obj);
  return obj;
};

export default function create() {
  const interactions = {};
  mixin(interactions);
  interactions.lasso = {
    active: () => false,
    action: () => {},
  };

  // Expose api through the select property to fit with selection-service.
  interactions.select = {
    on: interactions.on,
    removeListener: interactions.removeListener,
  };
  return interactions;
}
