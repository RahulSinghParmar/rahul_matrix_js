# From digital rain to Signal

## Problem

The forked experiment rendered a full-screen effect without controls or supporting context. Its speed depended on frame count, the last glyph could never be selected, and canvas resolution ignored device pixel ratio.

## Design and implementation

Signal gives the animation a control-room interface: an uninterrupted preview beside a compact settings panel, with typography that remains readable outside the canvas. Mobile moves controls below the preview. Three color presets provide a deliberate visual system without relying on external assets or a framework.

Each particle now has a stable speed, while elapsed time controls movement and trail fading. Resizing recalculates canvas dimensions and distribution. Pixel ratio is capped at two to bound rendering cost. Hidden tabs suspend the animation; reduced motion starts paused. Native HTML controls remain keyboard-operable, with settings validated before use and storage treated as optional.

## Evidence

- Pure tests cover frame-rate-independent movement, the final-glyph boundary and invalid settings.
- Browser tests cover palette changes, pause stability, settings persistence, reset, reduced motion, blocked storage and PNG downloads.
- Actual desktop and mobile screenshots document the implemented layout. They use a still frame and are not performance benchmarks.

This demonstrates Canvas 2D, animation scheduling, responsive layout, accessible interaction and modular JavaScript. The original fork is explicitly credited; the studio implementation is new.

## Tradeoffs and next steps

Resizing reseeds rain instead of preserving particle trajectories. Fullscreen depends on browser support. Frames are generative, so visual-regression tests would require seeded randomness and controlled timing. Performance profiling on low-powered physical devices and shareable presets would be sensible next steps.
