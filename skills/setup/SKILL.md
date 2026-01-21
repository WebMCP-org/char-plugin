---
name: setup
description: Set up Char embedded AI agent in a web app. Use when adding Char, embedding an AI chat widget, setting up WebMCP tools, or integrating browser automation.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, mcp__chrome-devtools__*, mcp__char-docs__*, mcp__webmcp-Docs__*, mcp__char-saas__*
metadata:
  author: WebMCP
  version: "1.0.0"
---

# Char Setup

Set up Char in three steps: **embed** → **style** → **add a tool**.

## Documentation Servers

Search these MCP servers for detailed information:

| Need | Server | Example Query |
|------|--------|---------------|
| Embedding, attributes, SSO | `mcp__char-docs__SearchChar` | "agent attributes", "auth-token" |
| Tool registration, API | `mcp__webmcp-Docs__SearchWebMcpDocumentation` | "registerTool", "useWebMCP" |

---

## Step 1: Embed the Agent

**Goal**: Get the agent visible on localhost.

### Detect the project

- Check `package.json` for framework (React, Vue, Next.js, etc.)
- Find the entry point (App.tsx, index.html, layout)
- Note the dev server port

### Install

```bash
npm install @mcp-b/embedded-agent
```

### Add the component

**React/Next.js:**
```jsx
import "@mcp-b/embedded-agent/web-component";
// In JSX:
<webmcp-agent anthropic-api-key="sk-ant-..." />
```

**Vue:**
```vue
<script setup>
import "@mcp-b/embedded-agent/web-component";
</script>
<template>
  <webmcp-agent anthropic-api-key="sk-ant-..." />
</template>
```

**HTML:**
```html
<script src="https://unpkg.com/@mcp-b/embedded-agent/dist/web-component-standalone.iife.js" defer></script>
<webmcp-agent anthropic-api-key="sk-ant-..."></webmcp-agent>
```

### Get the API key

Ask: **"What's your Anthropic API key?"**

No key? → https://console.anthropic.com/

> **Note**: `anthropic-api-key` only works on localhost. For production, use `auth-token` with SSO.

### Verify

1. Start dev server
2. `mcp__chrome-devtools__navigate_page({ url: "http://localhost:PORT" })`
3. `mcp__chrome-devtools__take_screenshot`
4. Look for the chat bubble

**For framework-specific details**: See [references/embedding.md](references/embedding.md)

---

## Step 2: Style the Agent

**Goal**: Match the user's brand.

### Extract colors

Look at their CSS or Tailwind config for:
- Primary/accent color
- Background and text colors
- Border color and radius

### Apply CSS variables

```css
webmcp-agent {
  --char-color-primary: #0f766e;
  --char-color-background: #ffffff;
  --char-color-foreground: #0f172a;
  --char-color-muted: #f1f5f9;
  --char-color-border: #e2e8f0;
  --char-radius: 0.75rem;
}
```

### Dark mode (if applicable)

```css
html.dark webmcp-agent {
  --char-color-background: #0f172a;
  --char-color-foreground: #e2e8f0;
  --char-color-muted: #1e293b;
  --char-color-border: #334155;
}
```

**For complete CSS variable reference**: See [references/styling.md](references/styling.md)

---

## Step 3: Create a WebMCP Tool

**Goal**: Let the agent interact with the UI.

### Import the polyfill

```typescript
import '@mcp-b/global';
```

### Ask what action to enable

**"What's one action you'd like the agent to help with?"**

Good first tools: fill a form, click a button, toggle a setting, read data.

### Register the tool

Example - form fill:

```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'fill_contact_form',
  description: 'Fill out the contact form',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
    required: ['name', 'email'],
  },
  async execute({ name, email }) {
    document.querySelector('[name="name"]').value = name;
    document.querySelector('[name="email"]').value = email;
    return { content: [{ type: 'text', text: `Filled form for ${name}` }] };
  },
});
```

### Test the tool

```
mcp__chrome-devtools__list_webmcp_tools
mcp__chrome-devtools__call_webmcp_tool({ name: "fill_contact_form", arguments: { name: "Test", email: "test@example.com" } })
mcp__chrome-devtools__take_screenshot
```

**For more tool patterns**: See [references/webmcp-tools.md](references/webmcp-tools.md)

---

## Summary

After all three steps, tell the user:

**What's working:**
- Agent embedded on localhost
- Styled to match the app
- First tool registered

**Next steps:**
- Add more tools: `mcp__webmcp-Docs__SearchWebMcpDocumentation({ query: "registerTool" })`
- Production SSO: `mcp__char-docs__SearchChar({ query: "identity provider" })`
- Advanced styling: `mcp__char-docs__SearchChar({ query: "CSS variables" })`

**Links:**
- https://docs.meetchar.ai (Char docs)
- https://docs.mcp-b.ai (WebMCP docs)
