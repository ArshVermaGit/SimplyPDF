# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-01-30

### Major Changes

- **UX & Stability Polish**: Enhanced the onboarding and consent experience by eliminating UI flickering and improving component loading reliability.
- **Portals Implementation**: All critical modals (Auth, Sign-In) now use React Portals to ensure perfect z-index management and layout consistency across the site.
- **Mobile Navigation Fixes**: Resolved background scrolling issues and added internal scroll support to the mobile menu, ensuring all tools are accessible on smaller devices.

### Added

- **Hydration Safety**: Components using client-side storage now feature improved hydration checks for more stable rendering.

### Fixed

- **Modals & Consent**: Fixed z-index layering and appearance delays for `WelcomeAuthModal` and `CookieConsent`.
- **Linting & Quality**: Resolved all `react-hooks/set-state-in-effect` linting errors for better performance and code health.
- **Contact Page**: Streamlined the contact experience by removing the complex message form in favor of direct communication channels (Email, Twitter, LinkedIn).

## [2.0.0] - 2026-01-30

### Major Changes

- **Complete UI/UX Redesign**: Launched a new, hyper-premium user interface with a modern aesthetic, improved navigation, and enhanced responsiveness.
- **New Branding**: Introduced a new logo and cohesive branding across the entire application.
- **SEO Overhaul**: Implemented comprehensive SEO improvements, including Open Graph tags, standardized metadata, and optimized structured data.
- **Asset Optimization**: All assets (logos, icons) are now served locally for better performance and privacy.

### Added

- **Social Sharing Cards**: Added `og-image.png` for rich previews on Twitter, Facebook, and LinkedIn.
- **Platform Icons**: Added support for various platform-specific icons (PWA, Apple Touch Icon).
- **Improved Navigation**: Header and Footer components have been updated for better usability and brand consistency.

### Fixed

- Resolved various layout issues, including centering of hero text and removal of unwanted whitespace.
- Fixed "JPG to PDF" tool layout to match the global design system.
- Ensured all external links in the Footer are accurate and functional.

## [1.0.0] - 2026-01-15

### Added

- Professional repository documentation (`LICENSE`, `CONTRIBUTING.md`, etc.)
- GitHub issue and pull request templates
- Initial project structure and core PDF tools
- Client-side PDF processing engine
- Hyper-premium UI with Tailwind CSS 4
