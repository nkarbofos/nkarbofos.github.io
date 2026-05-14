# Design System Document: Academic Sophistication in Code

## 1. Overview & Creative North Star: "The Digital Atheneum"
This design system moves beyond the standard "dashboard" aesthetic to create a **Digital Atheneum**—a space where the rigor of ITMO University’s engineering meets the ethereal clarity of modern web development. 

The Creative North Star is **Academic Precision through Soft Minimalism**. We avoid the "template" look by eschewing rigid, bordered grids in favor of **Organic Layering**. By blending GitHub’s information density, Linear’s obsessive cleanliness, and Vercel’s typographic authority, we create an environment that feels like a premium IDE—focused, intentional, and deeply intellectual. The layout should feel like an open canvas where projects take center stage, supported by a "ghost" architecture that only appears when needed.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in `primary` (#0041BB), but its application is surgical. We use color to define focus, not boundaries.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be achieved via:
1.  **Background Shifts:** Transitioning from `surface` to `surface-container-low`.
2.  **Tonal Transitions:** Using `surface-container-highest` to define a sidebar against a `surface` main content area.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent materials.
*   **Base:** `surface` (#fcf8f8) for the main application background.
*   **The Content Layer:** `surface-container-low` for large content blocks.
*   **The Focus Layer:** `surface-container-lowest` (#ffffff) for cards or code blocks to create a "pop" of pure clarity.
*   **The Glass Rule:** For floating elements (Modals, Hover Menus), use `surface` at 70% opacity with a `backdrop-filter: blur(12px)`. This integrates the UI into the background rather than sitting "on top" of it.

### Signature Textures
Main CTAs and Hero sections should utilize a subtle linear gradient: `primary` (#002d89) to `primary-container` (#0041bb). This provides a "soul" to the blue that flat hex codes lack, mimicking the depth of high-end retina displays.

---

## 3. Typography: The Editorial Scale
We use **Inter** as a variable font to bridge the gap between technical documentation and editorial design.

*   **Display (lg/md/sm):** Reserved for hero headlines and achievement milestones. Use `on-surface` with a tracking of `-0.02em` to create a dense, authoritative "Linear-style" feel.
*   **Headline & Title:** Used for project names and section headers. High contrast between `headline-lg` (2rem) and `body-md` (0.875rem) is essential to create an editorial hierarchy.
*   **Labels (md/sm):** For technical metadata (e.g., "Last Commit," "Build Status"). These should always use `on-surface-variant` to recede visually, ensuring the student's code and content remain the focal point.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too heavy for an academic platform. We achieve depth through light and transparency.

*   **The Layering Principle:** To lift a card, do not reach for a shadow first. Instead, place a `surface-container-lowest` element on a `surface-container` background.
*   **Ambient Shadows:** If a "floating" effect is mandatory (e.g., a dropdown), use an ultra-diffused shadow: `0px 12px 32px rgba(0, 0, 0, 0.04)`. The color should be a tinted variant of `on-surface`—never pure black.
*   **The "Ghost Border" Fallback:** When contrast is legally required for accessibility, use the `outline-variant` token at **15% opacity**. A 100% opaque border is considered a design failure in this system.
*   **Glassmorphism:** Use `surface-variant` at 40% opacity with a blur for student achievement icons, giving them a "medal" quality that feels earned and premium.

---

## 5. Components: Precision Primitives

### Buttons & Chips
*   **Primary Button:** Gradient (`primary` to `primary-container`), `md` (0.375rem) roundedness, white text. No border.
*   **Secondary/Ghost Button:** No background. `on-surface` text. On hover, a subtle `surface-container-high` background appears.
*   **Achievement Chips:** Use `secondary-container` backgrounds with `on-secondary-container` text. Apply a `0.25rem` (DEFAULT) radius for a modern, slightly technical look.

### Input Fields
*   **State:** Use `surface-container-lowest` as the base.
*   **Interaction:** Focus state should not use a heavy border; instead, use a 2px `surface-tint` glow with a soft spread.
*   **Error State:** Use `error` text and a `error-container` (soft red) background shift.

### Cards & Lists (The Academic Ledger)
*   **Rule:** Forbid divider lines.
*   **Separation:** Use `40px` (or `2.5rem`) of vertical white space to separate list items, or a subtle change in background color on hover (`surface-container-low`).
*   **Project Badges:** Small, high-contrast badges using `tertiary` for "Experimental" or `primary` for "Verified."

### Specialized Educational Components
*   **The Grade Indicator:** A large `display-sm` numeral with a `tertiary-container` glass-morphic background.
*   **Code Snippet Container:** Deep `inverse-surface` background with `primary-fixed` syntax highlighting. Use `xl` (0.75rem) corners to make code feel like a distinct "object."

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical white space to guide the eye toward the most important student metric.
*   **Do** lean into dark mode. Ensure the `surface-dim` and `surface-container` tiers provide enough contrast for late-night coding sessions.
*   **Do** use `title-lg` for project titles to give them a "published" feel.

### Don't:
*   **Don't** use 100% black text. Use `on-surface` (#1c1b1b) to maintain a softer, high-end reading experience.
*   **Don't** use "Drop Shadows" on buttons. Use tonal shifts to indicate interactivity.
*   **Don't** crowd the interface. If a screen feels "busy," increase the padding using the `xl` spacing scale.
*   **Don't** use default browser scrollbars. Use thin, `outline-variant` styled bars that disappear when not in use.