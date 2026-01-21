# Char Plugin for Claude Code

One-shot setup for [Char](https://docs.meetchar.ai) embedded AI agent with WebMCP browser tools.

## What is Char?

Char is an embeddable AI agent that can interact with your web application through WebMCP tools. Users chat with the agent, and it can fill forms, click buttons, navigate pages, and perform any action you expose as a tool.

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

```
/char:setup
```

This will:
1. Connect you to Char (creates account/org automatically via OAuth)
2. Configure allowed domains for your app
3. Install the npm package
4. Add the agent to your HTML/React/Vue app
5. Apply styling to match your theme
6. Verify everything works

## What's Included

### MCP Servers (Auto-configured)

| Server | Purpose |
|--------|---------|
| `char-saas` | Organization management, SSO config |
| `char-docs` | Char documentation search |
| `webmcp-docs` | WebMCP API documentation |
| `chrome-devtools` | Browser automation for testing |

### Skills

- `/char:setup` - Complete setup wizard

### Agents

- `integration-specialist` - Expert for adding WebMCP tools and advanced customization

## After Setup

### Add WebMCP Tools

Let the agent interact with your UI:

```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string' },
    },
    required: ['productId'],
  },
  execute: async ({ productId }) => {
    document.querySelector(`[data-product="${productId}"] .add-btn`)?.click();
    return { content: [{ type: 'text', text: 'Added to cart' }] };
  },
});
```

### Configure SSO (Production)

```
mcp__char-saas__manage_idp_config({
  action: "update",
  idp_type: "okta",
  idp_domain: "company.okta.com",
  idp_client_id: "your-client-id"
})
```

### Customize Styling

```css
webmcp-agent {
  --char-color-primary: #your-brand-color;
  --char-color-background: #ffffff;
  --char-color-foreground: #0f172a;
}
```

## Documentation

- [Char Docs](https://docs.meetchar.ai) - Full documentation
- [WebMCP Docs](https://docs.mcp-b.ai) - Tool registration API
- [Identity Providers](https://docs.meetchar.ai/identity-providers) - SSO setup guides

## Support

- [GitHub Issues](https://github.com/WebMCP-org/char-plugin/issues)
- Email: alex@mcp-b.ai

## License

MIT
