export function eventToLocalPoint(event, chart) {
  const bounds = chart.element.getBoundingClientRect();

  let x;
  let y;
  if (event.center) {
    ({ x } = event.center);
    ({ y } = event.center);
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  return {
    x: x - bounds.left,
    y: y - bounds.top,
  };
}
