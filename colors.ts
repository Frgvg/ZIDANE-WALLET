/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1c2c23',
    tint: '#286347',

    // Core surfaces
    background: '#f4f6ef',
    foreground: '#1c2c23',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#1c2c23',

    // Primary action color (buttons, links, active states)
    primary: '#286347',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#e8eee5',
    secondaryForeground: '#294235',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#e8eee5',
    mutedForeground: '#708077',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#e4f179',
    accentForeground: '#26351d',

    // Destructive actions (deletes, errors)
    destructive: '#bf5148',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#e0e7dc',
    input: '#dce5da',
  },

  dark: {
    text: '#f1f5ed',
    tint: '#dce971',
    background: '#111a15',
    foreground: '#f1f5ed',
    card: '#1b2820',
    cardForeground: '#f1f5ed',
    primary: '#dce971',
    primaryForeground: '#1e2a1e',
    secondary: '#26362c',
    secondaryForeground: '#e3ebe1',
    muted: '#26362c',
    mutedForeground: '#a1b0a4',
    accent: '#dce971',
    accentForeground: '#1e2a1e',
    destructive: '#e47c70',
    destructiveForeground: '#251412',
    border: '#33443a',
    input: '#3a4b40',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
