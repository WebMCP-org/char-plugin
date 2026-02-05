# Visual Integration Best Practices

Guidelines for making Char blend seamlessly with your website's design.

---

## Automated Visual Integration Workflow

When using the char-setup skill with Chrome DevTools MCP, the assistant performs comprehensive visual integration to ensure Char matches your page's design.

### Step 1: Analyze Existing Page Design

1. **Take baseline screenshot** - Capture your page before Char is added
2. **Extract color palette** - Run style extraction script ([assets/scripts/extract-page-styles.js](../assets/scripts/extract-page-styles.js)) to identify:
   - Background color
   - Text (foreground) color
   - Primary brand color (from buttons/links)
   - Accent/secondary colors
3. **Read typography** - Detect font family and size
4. **Identify design patterns** - Border radius, visual style
5. **Detect color scheme** - Determine if light or dark mode

### Step 2: Generate Matching Styles

1. **Map extracted colors to Char's CSS variables:**
   - Primary color from buttons/links → `--char-color-primary`
   - Background color from body → `--char-color-background`
   - Text color → `--char-color-foreground`
   - Border color → `--char-color-border`

2. **Match typography** - Apply the same font family via `--char-font-sans`

3. **Match border radius** - Apply the same roundness via `--char-radius`

4. **Generate CSS overrides** - Create a ready-to-use CSS block

### Step 3: Apply and Verify

1. **Add Char with generated styles** - Insert widget with custom styling

2. **Take verification screenshots:**
   - **Collapsed state** - Widget as a pill (default view)
   - **Expanded state** - Chat interface open
   - **Mobile viewport** - Responsive behavior (375px width)

3. **Visual quality checks:**
   - Colors harmonize with page design
   - Font matches page typography
   - Border radius is consistent
   - Contrast ratios meet accessibility standards
   - Pill position doesn't obscure important content

4. **Present before/after comparison** - Show screenshots side-by-side

5. **Highlight any issues** - Call out contrast problems or positioning conflicts

**Shadow DOM note:** Shadow DOM is always enabled. You cannot target internal elements with selectors, so all styling must go through CSS variables on ``.

### Example Workflow Output

```
📸 Baseline screenshot taken
🎨 Extracted styles:
   - Primary: #667eea (purple gradient)
   - Background: #ffffff (white)
   - Font: -apple-system, BlinkMacSystemFont, 'Segoe UI'
   - Radius: 8px
   - Mode: light

⚙️  Generated CSS variables:
   char-agent {
     --char-color-primary: #667eea;
     --char-color-background: #ffffff;
     --char-color-foreground: #333333;
     --char-radius: 8px;
     --char-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
   }

✨ Char added with custom styles

📸 Verification screenshots:
   ✅ char-integration-collapsed.png
   ✅ char-integration-expanded.png
   ✅ char-integration-mobile.png

👀 Visual integration complete! Char seamlessly matches your page design.
```

**Note:** Without Chrome DevTools MCP, the skill provides manual instructions for CSS variable customization.

---

## Color Matching

### Extracting Your Brand Colors

Your brand colors typically appear in these elements:

1. **Primary Color** - Found in:
   - Call-to-action buttons
   - Primary navigation links
   - Brand elements (logo, headers)
   - Interactive highlights

2. **Background Color** - The main page background

3. **Foreground Color** - Primary text color

4. **Accent Color** - Secondary highlights:
   - Badges
   - Tags
   - Link hover states
   - Success/info indicators

### Automatic Extraction (char-setup Skill)

When using the char-setup skill with Chrome DevTools MCP, colors are extracted automatically from your page.

### Manual Extraction

Run this in your browser console:

```javascript
// Get primary brand color from button
const button = document.querySelector('button, .btn, .cta');
const primary = button ? getComputedStyle(button).backgroundColor : null;

// Get background and text colors from body
const body = document.body;
const bodyStyles = getComputedStyle(body);
const background = bodyStyles.backgroundColor;
const foreground = bodyStyles.color;

console.log({ primary, background, foreground });
```

### Color Conversion

If you get RGB values, convert to hex:

```javascript
function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match) return rgb;
  const [r, g, b] = match.map(Number);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Example usage
rgbToHex('rgb(102, 126, 234)') // Returns: '#667eea'
```

---

## Typography

### Font Matching

For visual harmony, match your page's font family:

```html
// Get your page's font
const fontFamily = getComputedStyle(document.body).fontFamily;

// Apply to Char
<style>
  char-agent {
    --char-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
</style>
</char-agent>
```

### System Font Stacks

Common system font stacks:

**Modern/Default:**
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif
```

**Elegant:**
```css
'Helvetica Neue', Helvetica, Arial, sans-serif
```

**Technical/Code:**
```css
'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace
```

### Web Fonts

If using Google Fonts or custom fonts:

```html
<!-- 1. Include the font -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<!-- 2. Reference in CSS variables -->
<style>
  char-agent {
    --char-font-sans: "Inter", sans-serif;
  }
</style>
</char-agent>
```

**Important:** Ensure the font is loaded before Char initializes for best results.

---

## Border Radius

Match your page's border radius for consistent visual language.

### Common Border Radius Patterns

| Style | Radius | Use Case | Example Sites |
|-------|--------|----------|---------------|
| **Sharp/Modern** | `0` - `2px` | Minimal, tech-focused | GitHub, Linear |
| **Balanced** | `6px` - `8px` | Most websites | Twitter, Notion |
| **Friendly** | `12px` - `16px` | Consumer-facing | Stripe, Airbnb |
| **Pill** | `999px` | Playful, modern | Some mobile apps |

### Detection

```javascript
// Find border radius from common elements
const button = document.querySelector('button, .btn, input, .card');
const radius = button ? getComputedStyle(button).borderRadius : '8px';
console.log('Detected radius:', radius);
```

### Application

```html
<style>
  char-agent {
    --char-radius: 8px; /* Match your page */
  }
</style>
</char-agent>
```

---

## Placement

### Recommended: Collapsible Sidebar (Flex Sibling)

The recommended pattern docks Char as a right sidebar that **pushes content left** when opened — not a floating overlay.

```
div.flex.h-screen.w-full.overflow-hidden  (app shell)
├── div.flex.min-w-0.flex-1               (existing content)
│   ├── sidebar
│   ├── main content
│   └── etc.
├── div.shrink-0.overflow-hidden          (agent panel — 420px / 0px)
│   └── div (inner 420px)
│       └── char-agent
└── button.fixed                          (toggle — only when closed)
```

**Key rules:**
1. **Flex sibling** — the agent panel must be a direct sibling of the main content wrapper, not nested inside it
2. **`shrink-0`** — prevents the panel from being compressed by flex
3. **`overflow-hidden`** on the app shell — prevents horizontal scrollbar during the width transition
4. **Inner div at 420px** — prevents re-layout of the Char UI during the collapse animation
5. **Width transition** — animate between `width: 420px` (open) and `width: 0` (closed)

**Why this pattern:**
- Content pushes left — no z-index fights, no hidden content behind the widget
- Realistic integration look (matches production usage)
- Works with existing flex layouts

### Alternative: Fixed Overlay

For simple pages without flex layout, use a fixed-position overlay:

```html
<style>
  char-agent {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    z-index: 9999;
  }
</style>
```

### Avoiding Content Obscuring

**Test at different viewport sizes:**

| Viewport | Size | What to Check |
|----------|------|---------------|
| Desktop | 1920×1080 | Doesn't cover important CTAs |
| Laptop | 1366×768 | Visible but not intrusive |
| Tablet | 768×1024 | Adapts appropriately |
| Mobile | 375×667 | Doesn't block navigation |

**Elements to protect:**
- Primary CTAs (signup, purchase buttons)
- Form submit buttons
- Navigation menus
- Footer links
- Cookie/GDPR banners

**Using Chrome DevTools MCP:**

The char-setup skill automatically takes screenshots at different viewports to verify positioning.

---

## Dark Mode

### Auto-Detection

Let Char follow the user's system preference using CSS variables:

```html
<style>
  char-agent {
    --char-color-background: #ffffff;
    --char-color-foreground: #111827;
    --char-color-primary: #4f46e5;
    --char-color-border: #e5e7eb;
  }

  @media (prefers-color-scheme: dark) {
    char-agent {
      --char-color-background: #111827;
      --char-color-foreground: #e5e7eb;
      --char-color-primary: #a78bfa;
      --char-color-border: #374151;
    }
  }
</style>

</char-agent>
```

**Tip:** In dark mode, use slightly brighter primary colors for better visibility.

---

## Accessibility

### Color Contrast

WCAG 2.1 Level AA requires:

| Element | Minimum Ratio | Example |
|---------|---------------|---------|
| Normal text (< 18pt) | **4.5:1** | #333 on #fff = 12.6:1 ✅ |
| Large text (≥ 18pt) | **3:1** | #666 on #fff = 5.7:1 ✅ |
| UI components | **3:1** | Button vs background |

### Checking Contrast

**Using Chrome DevTools:**

1. Open DevTools (F12)
2. Select an element
3. View "Accessibility" pane
4. Check "Contrast" section

**Using Contrast Checker:**

Visit [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Common Contrast Issues

❌ **Bad:** Light purple (`#a78bfa`) text on white background
- Ratio: 2.3:1 (fails WCAG AA)

✅ **Good:** Dark purple (`#6d28d9`) text on white background
- Ratio: 7.2:1 (passes WCAG AAA)

**Tip:** The char-setup skill warns about contrast issues during visual verification.

---

## Responsive Design

### Mobile Considerations

**Viewport Behavior:**

```css
/* Char adapts automatically, but test these cases: */

/* Very small screens (< 360px) */
- Pill should still be clickable
- Text should remain readable

/* Standard mobile (375px - 428px) */
- Pill position shouldn't block nav
- Expanded view should be full-screen

/* Tablets (768px+) */
- Consider pill vs full thread layout
```

### Orientation Changes

Test both orientations:
- **Portrait** - Pill at bottom works well
- **Landscape** - Consider bottom-right position

---

## Testing Checklist

Before deploying Char to production:

### Visual Integration
- [ ] Screenshot shows widget blends with page design
- [ ] Primary color matches brand color
- [ ] Background/foreground colors are harmonious
- [ ] Fonts match page typography
- [ ] Border radius is consistent

### Placement
- [ ] Widget doesn't obscure important CTAs
- [ ] Doesn't block form submit buttons
- [ ] Doesn't cover footer links
- [ ] Works on mobile viewports
- [ ] Adapts to tablet sizes

### Accessibility
- [ ] Text contrast meets WCAG AA (4.5:1)
- [ ] Button contrast meets WCAG AA (3:1)
- [ ] Widget is visible against background (3:1)
- [ ] Dark mode has sufficient contrast (if applicable)
- [ ] Widget is keyboard accessible

### Functionality
- [ ] Widget opens/closes smoothly
- [ ] Expanded view is usable
- [ ] Voice button works (if enabled)
- [ ] WebMCP tools function correctly
- [ ] No console errors

### Cross-Browser
- [ ] Chrome/Edge (recommended)
- [ ] Safari (if targeting Mac/iOS users)
- [ ] Firefox (if significant user base)

---

## Example Implementations

### E-commerce Site (Shopify-style)

```html
<style>
  char-agent {
    --char-color-primary: #5c6ac4; /* Shopify purple */
    --char-color-background: #ffffff;
    --char-color-foreground: #212b36;
    --char-color-border: #c4cdd5;
    --char-radius: 4px;
    --char-font-sans: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', sans-serif;
  }
</style>
</char-agent>
```

### SaaS Product (Notion-style)

```tsx
<style>
  char-agent {
    --char-color-primary: #2383e2; /* Notion blue */
    --char-color-background: #ffffff;
    --char-color-foreground: #37352f;
    --char-color-border: #e9e9e7;
    --char-radius: 8px;
    --char-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
</style>
</char-agent>
```

### Landing Page (Stripe-style)

```tsx
<style>
  char-agent {
    --char-color-primary: #635bff; /* Stripe purple */
    --char-color-background: #ffffff;
    --char-color-foreground: #0a2540;
    --char-color-border: #e3e8ee;
    --char-radius: 12px;
    --char-font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  }
</style>
</char-agent>
```

---

## Troubleshooting

### Widget Looks Out of Place

**Possible causes:**
- Colors don't match brand palette
- Border radius differs from page style
- Font family doesn't match

**Solution:** Use char-setup skill to auto-generate matching CSS variables.

### Poor Contrast

**Symptom:** Text is hard to read, especially in messages

**Solution:**
```html
<style>
  char-agent {
    --char-color-background: #ffffff; /* Pure white */
    --char-color-foreground: #000000; /* Pure black */
  }
</style>
```

### Pill Obscures Content

**Symptom:** Important buttons or links are covered

**Solution:**
1. Change position: `bottom-center` ↔ `bottom-right`
2. Adjust z-index of page elements if needed
3. Test at different viewport sizes

### Widget Doesn't Match Dark Mode

**Symptom:** Widget stays light when page is dark

**Solution:**
```html
<style>
  char-agent {
    --char-color-background: #ffffff;
    --char-color-foreground: #111827;
  }

  @media (prefers-color-scheme: dark) {
    char-agent {
      --char-color-background: #111827;
      --char-color-foreground: #e5e7eb;
    }
  }
</style>
```

---

## Additional Resources

- [CUSTOMIZATION.md](./CUSTOMIZATION.md) - Complete styling reference
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [WEBMCP_REFERENCE.md](./WEBMCP_REFERENCE.md) - Available WebMCP tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Test color contrast
- [Can I Use](https://caniuse.com/) - Check browser compatibility
