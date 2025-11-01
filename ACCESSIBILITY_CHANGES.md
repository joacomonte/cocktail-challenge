# Accessibility changes (brief)

- **Add skip-to-content link** (`src/app/app.html`): lets keyboard and screen-reader users jump straight to the main content.
- **Wrap router outlet in `<main role="main">`** (`src/app/app.html`): provides a semantic landmark for screen readers.
- **Global accessibility utilities** (`src/styles.scss`): `.skip-link` (visible on focus), `.visually-hidden` for labels, and a visible focus outline to preserve keyboard focus visibility.
- **Mark results region as live/region** (`cocktails.page.html`): added `role="region" aria-live="polite" aria-label="Search results"` to the scroll container so assistive tech can be informed of new search results.
- **Loading announcements** (`cocktails.page.html`): changed loading container to `role="status" aria-live="polite"` so loading state is announced to screen readers.

These minimal changes improve keyboard navigation and screen-reader behavior without altering visible layout.


