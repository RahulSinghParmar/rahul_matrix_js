# Contributing

Use Node.js 22.13+ (or a newer supported LTS) for development. The deployed website has no runtime dependencies.

Run `npm ci`, `npm run lint`, `npm run format:check`, `npm test` and `npm run test:e2e` before submitting a pull request. Install the browser binaries first with `npx playwright install chromium firefox webkit`. Use `npm start` for a local preview.

Keep controls keyboard-operable with visible focus indicators and explicit labels. Respect reduced motion, preserve usable layouts at 320px and higher, and handle unavailable/corrupt local storage. Keep animation state separate from pure, unit-testable calculations.

Use `npm run format` for formatting. The screenshot test captures the actual app at desktop and mobile sizes into `docs/screenshots/`; review and commit intentional showcase updates. Screenshots are documentation, not pixel-perfect regression baselines.
