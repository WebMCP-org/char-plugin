---
name: setup
description: Set up Char embedded AI agent in your web application. Run this after installing the plugin.
---

# Char Setup

You are setting up Char, an embedded AI agent with WebMCP browser tools, in the user's web application.

## Prerequisites Check

Before starting, verify the MCP servers are connected:

1. **Test char-saas connection**: Call `mcp__char-saas__get_profile`
   - If this fails or triggers OAuth, guide the user through sign-in
   - This creates their organization automatically

2. **Confirm organization exists**: Call `mcp__char-saas__list_organizations`
   - Note the organization name for later reference

## Step 1: Configure Allowed Domains

Ask the user: "What domain(s) will you embed Char on? (e.g., https://app.example.com)"

Then configure via:
```
mcp__char-saas__manage_idp_config({
  action: "update",
  allowed_domains: ["https://user-provided-domain.com"]
})
```

**Important notes for the user**:
- `localhost` and `127.0.0.1` are allowed by default (any port)
- Production domains must be added explicitly
- Format: `https://hostname` or `https://hostname:port` (no trailing slashes)

## Step 2: Detect Project Type

Examine the user's project:
- Check `package.json` for framework (React, Vue, Next.js, etc.)
- Find the entry point (index.html, main.tsx, App.vue, etc.)
- Note the dev server port (Vite: 5173, CRA: 3000, Next: 3000, etc.)

## Step 3: Install Package

Run in the user's project:
```bash
npm install @mcp-b/embedded-agent
```

## Step 4: Add the Agent

Based on the detected framework:

### For HTML/Vanilla JS
Add to `index.html` before `</body>`:
```html
<script src="https://unpkg.com/@mcp-b/embedded-agent/dist/web-component-standalone.iife.js" defer></script>
<webmcp-agent anthropic-api-key="PLACEHOLDER"></webmcp-agent>
```

### For React/Next.js
Add to the root component:
```jsx
import "@mcp-b/embedded-agent/web-component";

// In the component JSX:
<webmcp-agent anthropic-api-key="PLACEHOLDER" />
```

### For Vue
Add to App.vue or main layout:
```vue
<script setup>
import "@mcp-b/embedded-agent/web-component";
</script>

<template>
  <webmcp-agent anthropic-api-key="PLACEHOLDER" />
</template>
```

**Ask the user for their Anthropic API key** to replace the placeholder.
Remind them: This is for development only. For production, use `auth-token` with SSO.

## Step 5: Style the Agent

Extract the host page's colors and apply CSS variables:

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

For dark mode support:
```css
html.dark webmcp-agent,
[data-theme="dark"] webmcp-agent {
  --char-color-background: #0b1220;
  --char-color-foreground: #e2e8f0;
  --char-color-muted: #111827;
  --char-color-border: #1f2937;
}
```

## Step 6: Verify Installation

1. Start the dev server if not running
2. Use Chrome DevTools MCP to navigate: `mcp__chrome-devtools__navigate_page({ url: "http://localhost:PORT" })`
3. Take a screenshot: `mcp__chrome-devtools__take_screenshot`
4. Check for errors: `mcp__chrome-devtools__list_console_messages({ types: ["error"] })`
5. Verify agent renders and opens

## Step 7: Summary

After successful setup, provide the user with:

1. **What was configured**:
   - Organization: [org name]
   - Allowed domains: [domains]
   - Framework detected: [framework]

2. **Next steps**:
   - For production: Configure SSO via `mcp__char-saas__manage_idp_config`
   - To add WebMCP tools: See https://docs.mcp-b.ai
   - To customize styling: See https://docs.meetchar.ai/guides/custom-styling

3. **Useful commands**:
   - View org config: `mcp__char-saas__manage_idp_config({ action: "get" })`
   - Search Char docs: `mcp__char-docs__SearchChar({ query: "..." })`

## Error Handling

If any step fails:
1. Check the specific error message
2. Search Char docs for guidance: `mcp__char-docs__SearchChar({ query: "error message" })`
3. If it's a bug, report to the user with reproduction steps
