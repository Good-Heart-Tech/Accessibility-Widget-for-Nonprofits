# Accessibility Widget for Nonprofits

<img src="assets/icon-mark.svg" alt="" width="72" height="72" align="right">

A free, open-source, self-hosted accessibility toolbar that Good Heart Tech can drop into any nonprofit client site with a single `<script>` tag.

## Why this exists

Paid overlay widgets (EqualWeb, AccessiBe, etc.) charge ongoing subscriptions and market themselves as full ADA/WCAG "compliance," which they are not. This project gives our nonprofit clients a genuinely free, no-lock-in alternative that:

- Adds visible, easy-to-find accessibility controls (font size, contrast, underline links, dyslexia-friendly font, reduce motion, etc.)
- Is self-hosted, so there's no third-party vendor, no tracking, and no recurring cost
- Is small enough for a volunteer engineer to read and modify in one sitting

**Important:** This widget improves usability. It does not make a site WCAG/ADA compliant on its own. Real compliance still requires correct semantic HTML, alt text, color contrast in the base design, and keyboard navigation in the underlying site.

## Status

v1 built: contrast modes, font/line/word/letter spacing, highlight links/headers, readable (dyslexia-friendly) font, enlarged cursor, browser-based text-to-speech, reset button, and persistent per-visitor settings via `localStorage`.

Not yet included (tracked as follow-up issues): language translation, virtual keyboard, AI image descriptions, custom site color remapping.

## Architecture

- Plain JS + CSS in `src/`, no framework, no runtime dependencies — `esbuild` is only a dev-time minifier
- `npm run build` minifies `src/widget.js` + `src/widget.css` into `dist/`, which is what gets served
- `demo/index.html` is a sample static page for manually testing every control
- Zero external network calls — no fonts, icon CDNs, or analytics

## Installation

Add one tag to any static site (works on Cloudflare Pages, WordPress, Squarespace, Wix — anywhere you can paste HTML). The widget injects its own styles, so no separate stylesheet link is needed:

```html
<script src="https://accessibility.goodhearttech.org/widget.js" defer></script>
```

### Brand colors

Override the toolbar's button and focus-outline colors globally by adding two data attributes to the script tag — no separate config file, no build step:

```html
<script
  src="https://accessibility.goodhearttech.org/widget.js"
  data-brand-primary="#7189ff"
  data-brand-accent="#a0ddff"
  defer>
</script>
```

- `data-brand-primary` — the toggle button background and pressed-toggle background (defaults to a navy blue)
- `data-brand-accent` — the focus-outline color (defaults to amber)

Both are plain CSS custom properties (`--ght-a11y-brand-primary`, `--ght-a11y-brand-accent`) set on `<html>`, so they can also be overridden in the host site's own CSS if preferred over data attributes.

## Deploying this project (Cloudflare Pages)

This repo is meant to be connected once to a Cloudflare Pages project so every client site shares the same hosted widget:

1. In the Cloudflare dashboard, create a new Pages project and connect it to this GitHub repo's `main` branch.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Add a custom domain (e.g. `accessibility.goodhearttech.org`) pointing at the Pages project.
5. Every push to `main` auto-deploys — no manual upload step, no GitHub Actions needed.

## Local development

```bash
npm install
npm run build
```

Then open `demo/index.html` through a local static server (not `file://`, since the demo needs relative script execution) to try every control.

## License

MIT — see [LICENSE](LICENSE).
