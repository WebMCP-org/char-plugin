# Customizing the Embedded Agent Widget

Guide to styling and configuring the Char embedded agent.

## Web Component Only

Char is embedded via the `` web component.

## Basic Embed

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>
<char-agent auth-token="YOUR_AUTH_TOKEN"></char-agent>
```

### Dev Mode (Testing Only)

```html
<char-agent dev-mode='{"anthropicApiKey":"sk-ant-..."}'></char-agent>
```

## Web Component Attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `auth-token` | string | Auth token for production usage |
| `dev-mode` | JSON | Dev mode config (stateless testing only) |
| `open` | boolean | Controlled open state |
| `enable-debug-tools` | boolean | Enable debug tools (prefixed with `debug_`) |

### dev-mode JSON

```json
{
  "anthropicApiKey": "sk-ant-...",
  "openaiApiKey": "sk-...",
  "useLocalApi": true
}
```

## Styling with CSS Variables

Customize the widget by setting CSS variables on the `<char-agent>` element:

```html
<style>
  char-agent {
    --char-color-primary: #8b5cf6;
    --char-color-background: #ffffff;
    --char-color-foreground: #111827;
    --char-radius: 12px;
    --char-font-sans: 'Inter', sans-serif;
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

### Semantic Variables

```css
--char-user-bubble-bg
--char-user-bubble-text
--char-assistant-bubble-bg
--char-assistant-bubble-text
--char-composer-bg
--char-composer-border
--char-composer-text
--char-composer-placeholder
--char-composer-button-bg
--char-composer-button-text
--char-tool-bg
--char-tool-border
--char-tool-text
--char-tool-header-bg
--char-tool-approve-bg
--char-tool-approve-text
--char-tool-deny-bg
--char-tool-deny-text
--char-code-bg
--char-code-text
```

## Dark Mode

Use `prefers-color-scheme` to swap variables:

```html
<style>
  char-agent {
    --char-color-background: #ffffff;
    --char-color-foreground: #111827;
    --char-color-primary: #4f46e5;
  }

  @media (prefers-color-scheme: dark) {
    char-agent {
      --char-color-background: #111827;
      --char-color-foreground: #e5e7eb;
      --char-color-primary: #a78bfa;
    }
  }
</style>
```

## Shadow DOM Limitations

Shadow DOM is always enabled.

- The widget renders inside Shadow DOM (no opt-out).
- WebMCP tools cannot select or interact with elements inside the widget.
- Use CSS variables on `` for styling.

## Development vs Production

**Dev/Test (stateless):**
- Use `dev-mode` with your Anthropic API key
- No persistence

**Production (auth-token):**
- Use `auth-token` for production embeds
- Persistent threads and usage tracking

## Security Best Practices

- Never ship provider API keys (Anthropic/OpenAI) to production clients.
- Use `auth-token` for production embeds.
- Keep `dev-mode` only for local testing.

## Next Steps

- See [VISUAL_INTEGRATION.md](./VISUAL_INTEGRATION.md) for design matching
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
