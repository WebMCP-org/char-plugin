---
name: char-setup
description: Set up Char - an AI agent platform with WebMCP browser automation tools and embedded chat widgets. Use when the user wants to add Char to their website, set up WebMCP tools, integrate the embedded agent widget, or add AI chat functionality with browser automation.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, mcp__chrome-devtools__*, mcp__char-docs__*, mcp__webmcp-Docs__*, mcp__char-saas-staging__*
metadata:
  author: WebMCP
  version: "2.0.0"
---

# Char Setup Orchestration

You are the conductor. MCP servers have the details. Follow this flow.

## Building Blocks

| MCP Server | Purpose | When to Use |
|------------|---------|-------------|
| `mcp__char-docs__SearchChar` | Char docs | Embedding, attributes, styling |
| `mcp__webmcp-Docs__SearchWebMcpDocumentation` | WebMCP API | Tool registration patterns |
| `mcp__chrome-devtools__*` | Browser automation | Verification, testing |
| `mcp__char-saas-staging__*` | Account management | Production setup (end) |

---

## Phase 1: Detect Project

1. Read `package.json` → detect framework (React, Vue, Next.js, plain HTML)
2. Find entry point (App.tsx, layout.tsx, index.html)
3. Note dev server port
4. **If unsure**: Ask the user to confirm

---

## Phase 2: Embed the Agent (Dev Mode)

**Option A: Script tags (simplest, works anywhere)**
```html
<script src="https://unpkg.com/@mcp-b/embedded-agent/dist/web-component-standalone.iife.js" defer></script>
<webmcp-agent dev-mode='{"anthropicApiKey":"sk-ant-..."}' />
```

**Option B: npm install (recommended for React/Vue/Next.js)**
```bash
npm install @mcp-b/embedded-agent
```
Then consult `mcp__char-docs__SearchChar({ query: "embed [framework]" })` for framework-specific syntax.

**Steps:**
1. Choose Option A for plain HTML/legacy, Option B for modern frameworks
2. Add component with `dev-mode` attribute containing the API key
3. **Ask**: "What's your Anthropic API key?" (or offer https://console.anthropic.com/)
4. **Verify**:
   - `chrome-devtools: navigate_page` → localhost
   - `chrome-devtools: take_screenshot` → confirm bubble visible
   - `chrome-devtools: list_console_messages` → check for errors

> `dev-mode` with API key only works on localhost. Production requires `auth-token`.

### Enable Debug Tools

Add `enable-debug-tools` to expose the embedded agent's UI as WebMCP tools:

```html
<webmcp-agent dev-mode='{"anthropicApiKey":"..."}' enable-debug-tools />
```

This lets you control the embedded agent directly from Chrome DevTools MCP:
- Open/close the chat panel
- Send messages programmatically
- Inspect agent state

Useful for testing the full flow without manual interaction.

---

## Phase 3: Position & Behavior

1. **Ask**: "How should the agent appear? (floating bubble, side panel, fills container)"
2. Discuss open/close state (button trigger vs always open)
3. **Consult**: `mcp__char-docs__SearchChar({ query: "open attribute positioning" })`
4. Add trigger button if needed
5. **Verify**: Screenshot with agent open

---

## Phase 4: Style to Match

1. Read their CSS/Tailwind config → extract brand colors
2. **Consult**: `mcp__char-docs__SearchChar({ query: "CSS variables theming" })`
3. Apply `--char-color-*` variables matching their brand
4. Handle dark mode if they have it
5. **Verify**: Screenshot to confirm visual match

---

## Phase 5: First WebMCP Tool

1. **Ask**: "What's one action the agent should help with?"
   - Examples: fill a form, click a button, read data, navigate
2. **Consult**: `mcp__webmcp-Docs__SearchWebMcpDocumentation({ query: "registerTool [use case]" })`
3. Write the tool code with proper error handling
4. **Verify**:
   - `chrome-devtools: list_webmcp_tools` → tool appears
   - `chrome-devtools: call_webmcp_tool` → test it directly
   - `chrome-devtools: take_screenshot` → see the result

---

## Phase 6: User Tests It

1. Prompt user: "Open the agent and ask it to [action]. Did it work?"
2. Iterate if needed based on feedback

---

## Phase 7: Comprehensive Coverage? (Optional)

1. **Ask**: "Want me to analyze your codebase and set up more tools? I can create comprehensive coverage for forms, actions, and navigation."
2. **If yes**: Use the `integration-specialist` agent to autonomously:
   - Discover all forms, buttons, and data displays
   - Generate tools following scoping rules
   - Create a routing tool for navigation
   - Test everything via chrome-devtools
3. **If no**: Move to production setup or wrap up

---

## Phase 8: Production Ready? (Optional)

1. **Ask**: "Want to take this to production with SSO?"
2. **If yes**:
   - `mcp__char-saas-staging__get_profile` → authenticate/create account
   - `mcp__char-saas-staging__manage_idp_config` → set allowed domains
   - **Consult**: `mcp__char-docs__SearchChar({ query: "identity provider SSO" })`
   - Replace `dev-mode` with `auth-token` flow
3. **If no**: "You're all set for local development!"

---

## Phase 9: Summary

Tell the user:

**What's working:**
- Agent embedded on localhost
- Styled to match the app
- First tool registered and tested

**Next steps:**
- Add more tools: `mcp__webmcp-Docs__SearchWebMcpDocumentation({ query: "registerTool" })`
- Production SSO: `mcp__char-docs__SearchChar({ query: "identity provider" })`
- Advanced styling: `mcp__char-docs__SearchChar({ query: "CSS variables" })`

**Links:**
- https://docs.usechar.com (Char docs)
- https://docs.mcp-b.ai (WebMCP docs)
