# Accessibility Widget for Nonprofits

<img src="assets/icon-mark.svg" alt="" width="72" height="72" align="right">

A free, open-source, self-hosted accessibility toolbar that Good Heart Tech can drop into any nonprofit client site with a single `<script>` tag.

**Live demo:** try it right now on [goodhearttech.org](https://goodhearttech.org) or [wosp.app](https://wosp.app), both run this widget in production. No install needed to see it in action.

## Why this exists

Paid overlay widgets (EqualWeb, AccessiBe, etc.) charge ongoing subscriptions and market themselves as full ADA/WCAG "compliance," which they are not. This project gives our nonprofit clients a genuinely free, no-lock-in alternative that:

- Adds visible, easy-to-find accessibility controls (font size, contrast, underline links, dyslexia-friendly font, reduce motion, etc.)
- Is self-hosted, so there's no third-party vendor, no tracking, and no recurring cost
- Is small enough for a volunteer engineer to read and modify in one sitting

**Important:** This widget improves usability. It does not make a site WCAG/ADA compliant on its own. Real compliance still requires correct semantic HTML, alt text, color contrast in the base design, and keyboard navigation in the underlying site.

## Status

v1 built: contrast modes, font/line/word/letter spacing, highlight links/headers, readable (dyslexia-friendly) font, enlarged cursor, browser-based text-to-speech, reset button, and persistent per-visitor settings via `localStorage`.

Not yet included (tracked as follow-up issues): language translation, virtual keyboard, AI image descriptions, custom site color remapping.

See [CHANGELOG.md](CHANGELOG.md) for what shipped and when.

## Architecture

- Plain JS + CSS in `src/`, no framework, no runtime dependencies. `esbuild` is only a dev-time minifier.
- `npm run build` minifies `src/widget.js` + `src/widget.css` into `dist/`, which is what gets served.
- `demo/index.html` is a sample static page for manually testing every control.
- No fonts, tracking, or analytics of any kind. The one exception is the toggle button's own icon, which loads Font Awesome from a CDN if the host page doesn't already have it. See "Icon" below for the full explanation.

## Installation

Add one tag to any static site (works on Cloudflare Pages, WordPress, Squarespace, Wix, anywhere you can paste HTML). The widget injects its own styles, so no separate stylesheet link is needed:

```html
<script src="https://accessibility.goodhearttech.org/widget.js" defer></script>
```

### Brand colors

Override the toolbar's button and focus-outline colors globally by adding two data attributes to the script tag. No separate config file, no build step:

```html
<script
  src="https://accessibility.goodhearttech.org/widget.js"
  data-brand-primary="#7189ff"
  data-brand-accent="#a0ddff"
  defer>
</script>
```

- `data-brand-primary`: the toggle button background and pressed-toggle background (defaults to a navy blue)
- `data-brand-accent`: the focus-outline color (defaults to amber)

`data-brand-accent` is checked against the panel's white background before it's applied (WCAG's 3:1 minimum contrast for UI components like focus indicators). If a site's chosen color doesn't pass, the widget quietly falls back to the default amber instead of shipping a focus outline nobody can actually see. An accessibility tool with an inaccessible focus indicator would be a pretty bad look.

Both are plain CSS custom properties (`--ght-a11y-brand-primary`, `--ght-a11y-brand-accent`) set on `<html>`, so they can also be overridden in the host site's own CSS if preferred over data attributes.

Each site that installs the widget sets its own colors independently. There is no shared or global setting. Good Heart Tech's own site and WOSP, for example, each pass their own values on their own script tag.

### Icon

The floating toggle button's icon defaults to Font Awesome's `fa-solid fa-universal-access` icon, the standard "person in a circle" symbol used across accessibility tools, so visitors recognize it immediately.

Override it to any other Font Awesome icon with `data-icon` on the script tag:

```html
<script
  src="https://accessibility.goodhearttech.org/widget.js"
  data-icon="fa-solid fa-wheelchair"
  defer>
</script>
```

The value is exactly the class string you would put on an `<i>` tag, so any free or kit-hosted Font Awesome icon works, not just a fixed set the widget ships with.

**The tradeoff this introduces:** unlike every other part of this widget, the icon is real Font Awesome markup, not an inline SVG, so it needs Font Awesome's CSS and font files to render. The widget checks the page for an existing Font Awesome `<link>` or Kit `<script>` tag first. If the host site already loads Font Awesome (Good Heart Tech's site does), nothing extra happens. If it does not, the widget adds one `<link>` to Font Awesome's CDN (`cdnjs.cloudflare.com`) itself. That is the one exception to this project having no other external network calls.

## Deploying this project (Cloudflare Pages)

This repo is meant to be connected once to a Cloudflare Pages project so every client site shares the same hosted widget:

1. In the Cloudflare dashboard, create a new Pages project and connect it to this GitHub repo's `main` branch.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Add a custom domain (e.g. `accessibility.goodhearttech.org`) pointing at the Pages project.
5. Every push to `main` auto-deploys. No manual upload step, no GitHub Actions needed.

## Local development

```bash
npm install
npm run build
```

Then open `demo/index.html` through a local static server (not `file://`, since the demo needs relative script execution) to try every control.

## License

MIT, see [LICENSE](LICENSE).
