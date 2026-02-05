/**
 * Extract page styles for Char style generation
 *
 * This script analyzes the current page's design system and extracts:
 * - Color palette (background, foreground, primary, accent)
 * - Typography (font family, size)
 * - Border radius patterns
 * - Light/dark mode preference
 *
 * Run via Chrome DevTools MCP evaluate_script tool
 *
 * @returns {Object} Extracted style information
 */
(function extractPageStyles() {
  const body = document.body;
  const computedBodyStyles = window.getComputedStyle(body);

  const styles = {
    colors: {
      background: computedBodyStyles.backgroundColor,
      foreground: computedBodyStyles.color,
      primary: extractPrimaryColor(),
      accent: extractAccentColor()
    },
    fonts: {
      family: computedBodyStyles.fontFamily,
      size: computedBodyStyles.fontSize
    },
    radius: extractBorderRadius(),
    mode: detectColorScheme()
  };

  return styles;

  /**
   * Extract primary brand color from interactive elements
   * Looks in buttons, links, and branded elements
   */
  function extractPrimaryColor() {
    // Priority order: most likely to contain brand color
    const selectors = [
      'button:not([disabled])',
      '.btn:not([disabled])',
      '.button:not([disabled])',
      'a[class*="button"]',
      '[class*="primary"]',
      '.cta',
      'a[class*="cta"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const styles = window.getComputedStyle(el);
        const bg = styles.backgroundColor;

        // Check if background color is set (not transparent)
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }

        // Fallback to border color for outline buttons
        const borderColor = styles.borderColor;
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent') {
          return borderColor;
        }
      }
    }

    // Fallback: try to find from links
    const link = document.querySelector('a');
    if (link) {
      const linkColor = window.getComputedStyle(link).color;
      if (linkColor) return linkColor;
    }

    return null;
  }

  /**
   * Extract accent/secondary color from highlights and decorative elements
   */
  function extractAccentColor() {
    const selectors = [
      '[class*="highlight"]',
      '[class*="accent"]',
      '[class*="secondary"]',
      '[class*="badge"]',
      '[class*="tag"]',
      'a:not([class*="button"]):not([class*="btn"])'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const styles = window.getComputedStyle(el);

        // Try background color first
        const bg = styles.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }

        // Then try text color
        const color = styles.color;
        if (color) return color;
      }
    }

    return null;
  }

  /**
   * Extract border radius pattern from UI elements
   */
  function extractBorderRadius() {
    const selectors = [
      'button',
      '.btn',
      '.button',
      'input[type="text"]',
      'input[type="email"]',
      '.card',
      '[class*="rounded"]'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        const radius = window.getComputedStyle(el).borderRadius;
        if (radius && radius !== '0px') {
          return radius;
        }
      }
    }

    // Default to a sensible value
    return '0.5rem';
  }

  /**
   * Detect light vs dark color scheme based on background luminance
   */
  function detectColorScheme() {
    const bgColor = computedBodyStyles.backgroundColor;

    // Try to parse as rgba/rgb
    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match.map(Number);

      // Calculate relative luminance using WCAG formula
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Threshold: > 0.5 = light, <= 0.5 = dark
      return luminance > 0.5 ? 'light' : 'dark';
    }

    // Check if using a prefers-color-scheme media query
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light
    return 'light';
  }
})();
