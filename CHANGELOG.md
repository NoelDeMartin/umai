# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- [#13](https://github.com/NoelDeMartin/umai/issues/13) Image upload with long titles on mobile.

## [v0.1.3](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.3) - 2023-03-17

### Fixed

- Ingredients parsing (wasn't parsing properly ingredient quantities at the end).

## [v0.1.2](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.2) - 2023-03-11

### Fixed

- Printing on mobile devices.
- Serializing flash routes.

## [v0.1.1](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.1) - 2023-03-11

### Added

- [#5](https://github.com/NoelDeMartin/umai/issues/5) Print recipes.
- [#7](https://github.com/NoelDeMartin/umai/issues/7) Show recipe containers in viewer.
- Unique [page titles](https://www.w3.org/DesignIssues/UserInterface.html#title), in order to distinguish multiple open tabs.
- Error logs can be viewed in the user menu (they are cleared on reload).

### Fixed

- [#8](https://github.com/NoelDeMartin/umai/issues/8) Support non-roman alphabets.
- Zombie recipes (some recipes would reappear after being deleted).

## [v0.1.0](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.0) - 2023-01-20

The first stable release of Umai!

Thanks to everyone who participated in the [beta feedback](https://github.com/NoelDeMartin/umai/issues/1).

### Added

- Recipes auto-linking. When a recipe is linked using a known url in description, ingredients, or instructions, the navigation will be captured for client-side routing.
- Application [ClientID](https://solid.github.io/solid-oidc/#clientids).

## [v0.1.0-beta.4](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.0-beta.4) - 2022-11-18

### Added

- Improved performance for recipes with long changes history.

### Fixed

- Fixed a bug where invalid history operations would be created (without a `crdt:property` triple). This could result in recipes having more history operations than necessary, you may want to check out your RDF data just in case.

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
