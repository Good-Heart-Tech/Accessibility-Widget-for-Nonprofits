# Accessibility Widget for Nonprofits

A free, open-source, self-hosted accessibility toolbar that Good Heart Tech can drop into any nonprofit client site with a single `<script>` tag.

## Why this exists

Paid overlay widgets (EqualWeb, AccessiBe, etc.) charge ongoing subscriptions and market themselves as full ADA/WCAG "compliance," which they are not. This project gives our nonprofit clients a genuinely free, no-lock-in alternative that:

- Adds visible, easy-to-find accessibility controls (font size, contrast, underline links, dyslexia-friendly font, reduce motion, etc.)
- Is self-hosted, so there's no third-party vendor, no tracking, and no recurring cost
- Is small enough for a volunteer engineer to read and modify in one sitting

**Important:** This widget improves usability. It does not make a site WCAG/ADA compliant on its own. Real compliance still requires correct semantic HTML, alt text, color contrast in the base design, and keyboard navigation in the underlying site.

## Status

Early shell — not yet built. See [Issues](../../issues) for planned work.

## Planned architecture

- Single vanilla JS file (`widget.js`), no build step, no dependencies
- One `<link>` for styles, one `<script>` tag for the client to install
- Settings persist per-visitor via `localStorage`
- Hosted from a Cloudflare Worker or GitHub Pages/CDN so clients just point a script tag at it

## Installation (once built)

```html
<script src="https://accessibility.goodhearttech.org/widget.js" defer></script>
```

## License

MIT — see [LICENSE](LICENSE).
