# Char Plugin for Claude Code

One-shot setup for [Char](https://docs.usechar.com) embedded AI agents with WebMCP tools.

## What is Char?

Char is an embeddable AI agent that can use your WebMCP tools to operate your product UI.

- Embed UI via `<char-agent-shell>` (preferred) or `<char-agent>`
- Authenticate embeds with a **publishable key**
- Optionally attach per-user identity with `idToken`
- Test tools directly with Chrome DevTools MCP

## Installation

### Option 1: Via Plugin Marketplace (Recommended)

```bash
# Add the WebMCP marketplace
/plugin marketplace add WebMCP-org/char-plugin

# Install the Char plugin
/plugin install char@webmcp
```

### Option 2: Direct Install

```bash
# Add from GitHub
/plugin marketplace add https://github.com/WebMCP-org/char-plugin
/plugin install char
```

## Usage

After installing, run:

```text
/char:setup
```

The setup flow is optimized for:
1. Publishable-key auth (`publishableKey` required)
2. Script-tag-first embeds (`@latest` CDN)
3. `<char-agent-shell>` default UX (pill + panel + responsive fullscreen)
4. WebMCP tooling + Chrome DevTools MCP verification
5. Framework guidance (Next.js/SSR client-only embedding)

## What's Included

### MCP Servers (Auto-configured)

| Server | Purpose |
|--------|---------|
| `char-saas` | Organization management (keys, domains, SSO config) |
| `char-docs` | Char documentation search |
| `webmcp-docs` | WebMCP API documentation |
| `chrome-devtools` | Browser automation for testing tools and embed behavior |

### Skills

- `/char:setup` - End-to-end setup using publishable keys, shell-first UI, and test workflow
- `/char:webmcp` - WebMCP tool-writing patterns, implementation, and dogfooding

### Agents

- `integration-specialist` - Autonomous agent to build comprehensive WebMCP tool coverage

## Recommended Embed (Script Tag + Shell)

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/shell-standalone.iife.js" defer></script>
<char-agent-shell id="char-shell"></char-agent-shell>
<script>
  window.addEventListener("DOMContentLoaded", () => {
    const shell = document.getElementById("char-shell");
    shell?.setAuth({ publishableKey: "pk_live_..." });
  });
</script>
```

## Next.js / SSR Note

`<char-agent>` and `<char-agent-shell>` are browser custom elements and should be rendered in a **client component**.

- Do not rely on server rendering for the widget runtime
- Use `dynamic(..., { ssr: false })` or a `'use client'` wrapper
- Pass `idToken` client-side with `connect()` / `setAuth()`

## Documentation

- [Char Docs](https://docs.usechar.com)
- [Embedding Guide](https://docs.usechar.com/guides/embedding-agent)
- [Framework Guides](https://docs.usechar.com/guides/frameworks/index)
- [WebMCP Docs](https://docs.mcp-b.ai)

## Support

- [GitHub Issues](https://github.com/WebMCP-org/char-plugin/issues)
- Email: alex@mcp-b.ai

## License

MIT
