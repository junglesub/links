# Card Instructions

## Profile Page

- Keep the page mobile-first and usable on desktop.
- Treat the hero card and link cards as the same visual layer.
- Prefer a restrained dark navy tone over bright accent-heavy styling.
- Keep vertical space tight so the page feels close to a digital business card.

## Theme

- Support `light` and `dark` modes.
- Default to the saved user choice when it exists.
- Otherwise follow the device color scheme.
- Apply the initial theme before the page becomes visible.
- Do not animate manual theme changes.
- Only use the short loading overlay to hide initial theme and language flicker.

## Language

- Support Korean and English.
- Default to the saved user choice when it exists.
- Otherwise follow the browser language.
- If the requested language is unavailable, fall back naturally and show a notice.
- In Korean view, show both the Korean name and English name on the same line.

## Links

- Link order is intentional and controlled from `content/site.yaml`.
- `url` is required for every link.
- If a link should have no description, set `description: ""`.
- Only use metadata-based description fallback when `description` is not configured at all.
- In English view, Korean-only links may be labeled with `(Korean)`.
- In Korean view, English-only links may be labeled with `(영문)`.

## Copy and Share

- Copy actions should show a centered success toast.
- The toast should use a green success tone and a check icon.
- The footer should expose the deployed site URL, a copy button, and a mobile-friendly share action.

## SEO and Crawling

- Keep SEO metadata statically rendered.
- Keep JSON-LD valid raw JSON inside the script tag.
- Keep the OG image generated at build time.
- Keep crawl blocking enabled through `robots.txt` and robots meta tags.

## Source of Truth

- `content/site.yaml` is the content source of truth.
- `scripts/build.mjs` is the rendering source of truth.
- `docs/` is generated output, not the place for manual edits.
