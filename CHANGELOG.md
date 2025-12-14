# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.10](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.10) - 2025-12-14

### Changed

- [Christmas attire](https://github.com/NoelDeMartin/umai/tree/v0.1.10/src/assets/icons/umai-xmas.svg).

## [v0.1.9](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.9) - 2025-04-22

### Fixed

- [#29](https://github.com/NoelDeMartin/umai/issues/29) Using image uploads in environments with fingerprinting protection (for example, Firefox private mode).

## [v0.1.8](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.8) - 2025-01-05

### Added

- Cook Mode! You can now follow instructions step by step and set up timers.
    - [#24](https://github.com/NoelDeMartin/umai/issues/24) Also, the screen will be prevented from sleeping whilst cooking.

### Changed

- Removed Christmas attire.

### Fixed

- Log in issues with CSS v7.1.3 (See [CommunitySolidServer/CommunitySolidServer#1972](https://github.com/CommunitySolidServer/CommunitySolidServer/issues/1972)).

## [v0.1.7](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.7) - 2024-12-03

### Added

- [#15](https://github.com/NoelDeMartin/umai/issues/15) Pasting multi-line ingredients.
- [#18](https://github.com/NoelDeMartin/umai/issues/18) Log in from not found page.
- [#23](https://github.com/NoelDeMartin/umai/issues/20) Viewing private recipes in Viewer.

### Changed

- [Christmas attire](https://github.com/NoelDeMartin/umai/tree/v0.1.7/src/assets/icons/umai-xmas.svg).

### Fixed

- [#17](https://github.com/NoelDeMartin/umai/issues/17) Importing recipes with html entities.
- [#20](https://github.com/NoelDeMartin/umai/issues/20) Viewer auto-linking.

## [v0.1.6](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.6) - 2024-01-07

### Changed

- Removed Christmas attire.

### Fixed

- [#9](https://github.com/NoelDeMartin/umai/issues/9) Updated images don't use recipe permissions.
- [#14](https://github.com/NoelDeMartin/umai/issues/14) "Back to cookbook" navigates to authorization page.

## [v0.1.5](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.5) - 2023-12-22

### Changed

- [Christmas attire](https://github.com/NoelDeMartin/umai/tree/v0.1.5/src/assets/icons/umai-xmas.svg).

## [v0.1.4](https://github.com/NoelDeMartin/umai/releases/tag/v0.1.4) - 2023-11-24

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
