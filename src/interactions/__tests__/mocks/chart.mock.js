export function componentMock() {
  return {
    show: true,
    emit: sinon.stub(),
  };
}

export default function chartMock() {
  return {
    componentsFromPoint: sinon.stub().returns([]),
    shapesAt: sinon.stub().returns([]),
    brushFromShapes: sinon.stub(),
    component: sinon.stub().returns(componentMock()),
    element: {
      getBoundingClientRect: sinon.stub().returns({
        left: 0,
        top: 0,
      }),
    },
  };
}
