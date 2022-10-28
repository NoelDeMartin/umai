# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.0-beta.3](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.0-beta.3) - 2022-10-28

### Added

- Settings modal.
- Language selector.
- Servings selector.
- Publish unlisted recipes.
- Error reporting to [Sentry](https://sentry.io/) (opt-in).
- [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) durations support.
- Reconcile changes done in other applications that don't update the changes history.
- Works with existing recipes using `http://schema.org` (instead of `https://schema.org`).

### Fixed

- Updating images.
- `schema:image` and `schema:sameAs` properties are now written as links instead of plain strings.

## [v0.1.0-beta.2](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.0-beta.2) - 2022-09-17

### Added

- Better error handling for application startup and failed network requests.
- Interoperability improvements.
- Accessibility improvements.

### Fixed

- [#2](https://github.com/NoelDeMartin/umai/issues/2) Creating containers in NSS.
- Image uploading.

## [v0.1.0-beta.1](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.0-beta.1) - 2022-08-15

### Added

- List public recipes.
- Show other recipes and import them from the viewer.
- Better error handling for failed login attempts.

### Fixed

- Layout for large screens was botched.
- Logging in with `login.inrupt.com`.
- Recipes searchbox in the home screen wasn't working properly.
- Creating nested containers.

## [v0.1.0-beta.0](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.0-beta.0) - 2022-07-31

### Added

- First complete version before initial release.

## [alpha](https://github.com/NoelDeMartin/umai/releases/tag/alpha) - 2021-10-05

### Added

- Initial version showcasing data synchronization mechanisms, provisional UI.
