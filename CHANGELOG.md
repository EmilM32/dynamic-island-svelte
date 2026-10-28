# Changelog

All notable changes to this package are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the package uses [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2026-10-28

### Added

- `Island`: `--island-bg`, `--island-fg`, `--island-shadow`, `--island-z`, and `--island-top` custom properties.
- `Island`: `data-paused` on the shell while the notification timer is paused.

### Changed

- `Island`: the notification timer pauses while the island is hovered, holds focus, or the tab is hidden, and resumes with the time that was left.
- `Island`: when the layer holding focus is hidden, focus returns to the last element focused outside the island instead of falling to `<body>`.

## [0.2.0] - 2026-10-27

### Added

- `Island`: optional `label` prop for the region's accessible name. Defaults to `'Island'`.

### Changed

- `Island`: Escape and outside presses no longer call `oncollapse` when another handler already called `preventDefault()` on the event.

### Removed

- `Island`: `will-change` on the shell's width, height, and radius. It had no effect on layout properties.

## [0.1.0] - 2026-10-27

- First release: `Island`, `RollingDigits`, `islandSizes`, and the default constants.

[0.3.0]: https://github.com/EmilM32/dynamic-island-svelte/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/EmilM32/dynamic-island-svelte/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/EmilM32/dynamic-island-svelte/releases/tag/v0.1.0
