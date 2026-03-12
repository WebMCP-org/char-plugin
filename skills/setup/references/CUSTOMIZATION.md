# Customization Guide (Shell + Agent)

Style Char via CSS variables on `<char-agent-shell>` or `<char-agent>`.

## Preferred Embed Base

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/shell-standalone.iife.js" defer></script>
<char-agent-shell id="char-shell"></char-agent-shell>
<script>
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("char-shell")?.setAuth({ publishableKey: "pk_live_..." });
  });
</script>
```

## Styling with CSS Variables

```html
<style>
  char-agent-shell {
    --char-color-primary: #2563eb;
    --char-color-background: #ffffff;
    --char-color-foreground: #0f172a;
    --char-color-muted: #f8fafc;
    --char-color-border: #e2e8f0;
    --char-radius: 12px;
    --char-font-sans: "Inter", system-ui, sans-serif;
  }
</style>
```

### Core Variables

```css
--char-color-background
--char-color-foreground
--char-color-primary
--char-color-primary-foreground
--char-color-muted
--char-color-muted-foreground
--char-color-border
--char-radius
--char-font-sans
```

## Shell Positioning and Size

```html
<char-agent-shell panel-width="420"></char-agent-shell>
```

Notes:
- Shell manages pill/panel/fullscreen behavior.
- Desktop open mode is right-side inline panel.
- Mobile open mode is fullscreen.

## Dark Mode

```css
char-agent-shell {
  --char-color-background: #ffffff;
  --char-color-foreground: #0f172a;
}

@media (prefers-color-scheme: dark) {
  char-agent-shell {
    --char-color-background: #0b1220;
    --char-color-foreground: #e2e8f0;
    --char-color-border: #1e293b;
  }
}
```

## Runtime Auth and Identity

Use JS APIs for auth values:

```ts
shell.setAuth({ publishableKey: "pk_live_...", idToken });
```

Do not pass user tokens in DOM attributes.

## Iframe Boundary

The visible assistant UI is iframe-owned. WebMCP tools cannot target internal widget DOM.
Customize with:
- CSS variables
- element attributes
- JS API (`setAuth`, `setHostContext`, `setOpen`, `toggleOpen`)

## Next Steps

- See [VISUAL_INTEGRATION.md](./VISUAL_INTEGRATION.md)
- See [PRODUCTION.md](./PRODUCTION.md)
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md)
