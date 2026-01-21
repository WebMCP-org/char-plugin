# Styling Reference

Complete CSS custom properties for theming the Char agent.

## How Styling Works

The agent renders in **Shadow DOM**, which isolates its styles. You cannot select internal elements with CSS. Instead, set CSS custom properties on the `<webmcp-agent>` element and they cascade into the shadow tree.

## Quick Theme

```css
webmcp-agent {
  --char-color-primary: #0f766e;
  --char-color-background: #ffffff;
  --char-color-foreground: #0f172a;
}
```

## Complete Variable Reference

### Brand Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--char-color-primary` | `#0f766e` | Primary accent color (buttons, links) |
| `--char-color-primary-foreground` | `#ffffff` | Text on primary color |

### Surface Colors

| Variable | Default | Description |
|----------|---------|-------------|
| `--char-color-background` | `#ffffff` | Main chat background |
| `--char-color-foreground` | `#0f172a` | Primary text color |
| `--char-color-muted` | `#f1f5f9` | Secondary surfaces, input backgrounds |
| `--char-color-border` | `#e2e8f0` | Borders and dividers |

### Message Bubbles

| Variable | Default | Description |
|----------|---------|-------------|
| `--char-user-bubble-bg` | `var(--char-color-primary)` | User message background |
| `--char-user-bubble-fg` | `var(--char-color-primary-foreground)` | User message text |
| `--char-assistant-bubble-bg` | `var(--char-color-muted)` | Assistant message background |
| `--char-assistant-bubble-fg` | `var(--char-color-foreground)` | Assistant message text |

### Shape & Typography

| Variable | Default | Description |
|----------|---------|-------------|
| `--char-radius` | `0.75rem` | Border radius for cards, buttons |
| `--char-font-sans` | `system-ui, sans-serif` | Font family |

## Dark Mode

### Using class toggle

```css
html.dark webmcp-agent {
  --char-color-background: #0f172a;
  --char-color-foreground: #e2e8f0;
  --char-color-muted: #1e293b;
  --char-color-border: #334155;
}
```

### Using data attribute

```css
[data-theme="dark"] webmcp-agent {
  --char-color-background: #0f172a;
  --char-color-foreground: #e2e8f0;
  --char-color-muted: #1e293b;
  --char-color-border: #334155;
}
```

### Using media query

```css
@media (prefers-color-scheme: dark) {
  webmcp-agent {
    --char-color-background: #0f172a;
    --char-color-foreground: #e2e8f0;
    --char-color-muted: #1e293b;
    --char-color-border: #334155;
  }
}
```

## Tailwind Integration

If using Tailwind, extract colors from your config:

```css
webmcp-agent {
  --char-color-primary: theme('colors.teal.700');
  --char-color-background: theme('colors.white');
  --char-color-foreground: theme('colors.slate.900');
  --char-color-muted: theme('colors.slate.100');
  --char-color-border: theme('colors.slate.200');
  --char-radius: theme('borderRadius.lg');
}
```

## Example Themes

### Slate (Default)

```css
webmcp-agent {
  --char-color-primary: #0f766e;
  --char-color-primary-foreground: #ffffff;
  --char-color-background: #ffffff;
  --char-color-foreground: #0f172a;
  --char-color-muted: #f1f5f9;
  --char-color-border: #e2e8f0;
  --char-radius: 0.75rem;
}
```

### Blue Corporate

```css
webmcp-agent {
  --char-color-primary: #2563eb;
  --char-color-primary-foreground: #ffffff;
  --char-color-background: #ffffff;
  --char-color-foreground: #1e293b;
  --char-color-muted: #f8fafc;
  --char-color-border: #e2e8f0;
  --char-radius: 0.5rem;
}
```

### Purple Vibrant

```css
webmcp-agent {
  --char-color-primary: #7c3aed;
  --char-color-primary-foreground: #ffffff;
  --char-color-background: #faf5ff;
  --char-color-foreground: #1e1b4b;
  --char-color-muted: #f3e8ff;
  --char-color-border: #e9d5ff;
  --char-radius: 1rem;
}
```

## Documentation

For more styling options:
```
mcp__char-docs__SearchChar({ query: "CSS variables custom styling" })
```
