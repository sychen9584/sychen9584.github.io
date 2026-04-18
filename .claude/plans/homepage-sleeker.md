# Sleeker Homepage: Technical Proficiencies, Work Experience, Education

## Context

The homepage (`_pages/about.md`) currently mixes three inconsistent visual styles:

1. **Technical Proficiencies** uses ~26 `shields.io` PNG badges with unrelated hex colors — heavy, slow to load from an external service, cause layout shift, ignore dark mode, and clash visually with the academic tone of the rest of the site.
2. **Work Experience** and **Education** use inline-styled `<ul>` with `<i><strong>` markup and `&ensp;` for spacing — no visual hierarchy, dates share the line with the institution, no accent or separation.
3. The **Download Resume** button floats right via `style="float: right;"` — breaks responsive flow and looks out of place next to the bio blockquote.

The site already supports dark mode via CSS custom properties on `:root` (`_sass/theme/_default.scss`) and `[data-theme="dark"]` (`_sass/theme/_dark.scss`), plus Font Awesome 6 solid/brands and Academicons — but the homepage doesn't use any of that infrastructure.

**Goal:** refresh these three sections into a cohesive, theme-aware design that loads instantly, respects dark mode, and feels consistent with the sidebar and navbar typography.

## Recommended Approach

Drop shields.io badges and inline HTML lists, and replace with three small reusable components styled in a new SCSS partial. All new markup stays inside `about.md` as HTML blocks (kramdown GFM permits this) — no layout or include changes needed.

### 1. Header row (bio + resume CTA)

Wrap the blockquote bio and the resume button in a single flex row so they sit side-by-side on wide screens and stack cleanly on mobile. Replace the 📄 emoji with `<i class="fas fa-file-arrow-down"></i>` to match the Font Awesome iconography already used in `_includes/author-profile.html`.

### 2. Technical Proficiencies → categorized chip rows

Convert each category (Skills / Languages & Platforms / Frameworks & Packages) into a row with a bold left-aligned category label and a horizontally wrapping set of `.tech-chip` pills on the right. Chips are pure HTML + CSS — no external images.

- Where a Font Awesome brand icon exists (python, r-project, linux, aws, git, github), prepend `<i class="fab fa-python"></i>` for visual interest. Other chips stay text-only for consistency.
- Chip background uses `var(--global-border-color)`; text uses `var(--global-text-color)`; hover raises slightly and tints toward `var(--global-link-color)`. Dark mode picks this up automatically.

### 3. Work Experience & Education → two-column timeline

Use a simple two-column flex row per item:

- **Left column:** role/degree (bold) with institution on a second line (muted color via `var(--global-text-color-light)`).
- **Right column:** date range, right-aligned, monospace-ish, muted.
- A thin left border on each item (`border-left: 2px solid var(--global-border-color)`) creates an implicit vertical timeline without overengineering it.
- Stacks to a single column under `$small` (600px) breakpoint.

## Files to Modify

- **Create** `_sass/layout/_homepage.scss` — new partial containing `.hero-cta`, `.tech-stack`, `.tech-stack__group`, `.tech-chip`, `.timeline`, `.timeline-item`, `.timeline-item__role`, `.timeline-item__org`, `.timeline-item__date`. ~80 lines. All colors reference existing CSS variables so dark mode works automatically.
- **Edit** `assets/css/main.scss` — add one `"layout/homepage",` line alongside the existing layout imports in the comma-separated `@import` block (after `"layout/archive"` / `"layout/sidebar"`).
- **Edit** `_pages/about.md` — replace:
  - Lines 10–17 (blockquote + floated resume button) with a `<div class="hero-cta">` flex wrapper.
  - Lines 19–51 (shields.io badges) with three `<div class="tech-stack__group">` rows.
  - Lines 55–60 and 62–67 (the two `<ul>` blocks) with `<div class="timeline">` blocks of `<div class="timeline-item">` entries.

## Reusable Pieces Leveraged

- **CSS variables** from `_sass/theme/_default.scss` and `_dark.scss` — `--global-border-color`, `--global-text-color`, `--global-text-color-light`, `--global-link-color`, `--global-bg-color` — so dark mode is free.
- **Font Awesome 6 + Academicons** — already loaded via `assets/css/main.scss`; no new vendor CSS needed.
- **Existing breakpoint mixins** in `_sass/` (`@include breakpoint($small)`, defined in `_themes.scss`) — same pattern used in `_archive.scss` for responsive collapsing.
- **Existing button base** (`.btn`, `.btn--info`) from `_sass/layout/_buttons.scss` — keep for the resume CTA, just drop the inline float.

Deliberately *not* reusing `.feature__wrapper` / `.feature__item` — those are card grids designed for portfolio tiles with images, too heavy for the dense, text-first layout these three sections need.

## Verification

1. `bundle exec jekyll serve -l -H localhost` and open `http://localhost:4000/`.
2. Check the home page in light mode: bio + resume button share a row on wide screens; tech chips wrap cleanly; timeline items align roles on the left and dates on the right; category labels are clearly separated.
3. Toggle the masthead theme switch → confirm chips, timeline borders, and muted text all recolor via the CSS variables (no hardcoded colors).
4. Resize to ≤600px: the hero CTA stacks, tech chips still wrap, timeline items collapse to one column with the date moving below the role.
5. View-source on the rendered page → confirm no `img.shields.io` requests remain (DevTools Network tab filtered by "shields").
6. Click "Download Resume" → verifies `/files/pdf/sam_chen_resume_bioinfo.pdf` still downloads.
7. Run the existing dark-mode `theme-toggle.js` flow and reload with `localStorage.theme = "dark"` to confirm no FOUC in the new sections.

## Out of Scope

- Changing the author sidebar (`_includes/author-profile.html`) or masthead.
- Touching publications, talks, teaching, or portfolio pages.
- Adding new Jekyll plugins or build steps.
- Re-ordering sections or adding new content (e.g., Publications highlight) — can be a follow-up.
