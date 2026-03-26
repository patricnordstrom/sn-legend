export default function eventMock() {
  return {
    center: {
      x: 0,
      y: 0,
    },
    deltaX: 0,
    deltaY: 0,
    deltaMode: 0,
    srcEvent: {
      ctrlKey: false,
      shiftKey: false,
      target: {
        hasAttribute: sinon.stub().returns(false),
      },
    },
    pointers: [],
    preventDefault() {},
  };
}
