## Summary

<!-- What does this PR do and why? 1–3 sentences. Avoid repeating the title. -->

## Motivation

<!-- What problem does this solve? Why now? What would break or be missing without this change? -->

## How it works

<!-- Non-obvious implementation details. Reference file paths and function names. Use sub-sections when the change touches multiple layers. -->

### Storage
<!-- How is new state stored / persisted? (soft property, layout key, viewState, snapshot, etc.) -->

### Render time
<!-- How does this affect the rendering pipeline? (picasso-definition.js, heavy-update.js, colorService) -->

### Interaction
<!-- How does this affect gestures or selections? (tap.js, range.js, legend-pan.js, native.js) -->

## Files changed

| File | What changed |
|---|---|
| `src/...` | ... |

## Testing

- [ ] `pnpm run test` passes
- [ ] `pnpm run lint` passes
- [ ] `pnpm run build` succeeds
- [ ] Manual steps tested:

<!-- List what you clicked/verified in the browser. E.g.:
- Categorical legend: clicked item, selection applied to linked chart
- Sequential legend: dragged range, measure selection triggered
- Responsive = 'always': legend visible even in tiny container
- Expression target = 'dimension'/'measure': correct colors shown
- Auto dock: resolves to 'top' in wide container, 'left' in tall container
-->
