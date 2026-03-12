---
name: char-setup
version: 3.1.0
description: Set up Char embeds with the current publishable-key auth model, shell-first UX, WebMCP tools, and Chrome DevTools MCP testing. Use when integrating Char into a website/app, configuring the pill/panel experience, setting up WebMCP tools, or handling Next.js/SSR-safe embedding.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, mcp__chrome-devtools__*, mcp__char-docs__*, mcp__webmcp-Docs__*, mcp__char-saas-staging__*
---

# Char Setup Assistant

Integrate Char using the current runtime contract and preferred deployment path.

## Current Contract (Use This)

- `publishableKey` is required
- `idToken` is optional (per-user identity)
- Prefer `<char-agent-shell>` for most integrations
- Prefer script-tag CDN (`@latest`) for fastest, always-current setup
- Treat the embedded UI as iframe-owned

Do not use legacy `dev-mode`, `auth-token`, `clientId`, `organizationId`, or `ticketAuth` patterns.

## Quick Reference

| Task | Recommended path |
|------|------------------|
| Fastest embed | Script tag + `<char-agent-shell>` |
| Advanced host control | `<char-agent>` directly |
| Per-user identity | `connect({ publishableKey, idToken })` or `setAuth({ publishableKey, idToken })` |
| Tool development | Register tools with `@mcp-b/global`, then test via Chrome DevTools MCP |
| Next.js | Client component only (`'use client'` + `dynamic(..., { ssr: false })`) |
| Pill/panel behavior | Use shell defaults, then tune `panel-width` and theme vars |

## Setup Workflow

### Step 1: Validate Local Tooling

Required:
- Chrome/Edge/Chromium
- A publishable key from Char dashboard

Recommended:
- Chrome DevTools MCP
- WebMCP Docs MCP
- Char SaaS MCP

Install Chrome DevTools MCP if missing:

```bash
claude mcp add --transport stdio chrome-devtools -- npx -y @mcp-b/chrome-devtools-mcp@latest
```

### Step 2: Prefer Script Tag + Shell

Use this as the default integration unless the user has a strong reason not to.

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

Why this path:
- Always up to date (`@latest`)
- No bundler wiring needed
- Includes the built-in pill/panel/fullscreen shell behavior

### Step 3: Add Per-User Identity (Optional)

If the host app has signed-in users:

```ts
shell.setAuth({
  publishableKey: "pk_live_...",
  idToken,
});
```

Never place `idToken` in HTML attributes.

### Step 4: Configure WebMCP Tools

Install polyfill once in app entry:

```bash
npm install @mcp-b/global
```

```ts
import "@mcp-b/global";
```

Register app tools through `navigator.modelContext.registerTool(...)`.
Keep tools scoped to app capabilities (forms, navigation, reads, actions).

### Step 5: Dogfood with Chrome DevTools MCP

Use Chrome DevTools MCP to verify tool registration and runtime behavior:

```text
list_webmcp_tools summary=true
call_webmcp_tool name="your_tool" arguments={}
call_webmcp_tool name="your_tool" arguments={"field":"value"}
```

For shell/widget checks:
- Confirm pill appears when closed
- Confirm panel opens/closes cleanly
- Confirm mobile/narrow viewport becomes fullscreen
- Confirm page content is not obscured unexpectedly

If needed, add debug tools on the element:

```html
<char-agent-shell enable-debug-tools></char-agent-shell>
```

## Pill and Panel Positioning (Shell)

`<char-agent-shell>` is the preferred host UX and owns:
- Collapsed pip/pill behavior
- Desktop inline panel behavior
- Mobile fullscreen behavior
- Resize + edge-tab interactions

Recommended tuning knobs:
- `panel-width="420"` for desktop width baseline
- CSS variables (`--char-color-*`) on `char-agent-shell` or ancestor
- host page layout that leaves room for right-side panel when open

Use `<char-agent>` directly only if the host app already has a custom shell/layout system.

## Next.js and SSR-Safe Embedding

The widget runtime is browser-only. Use client rendering for custom elements.

### Recommended pattern

1. Create a client component for Char.
2. Import `@mcp-b/char/shell-component` in that component.
3. Render with `dynamic(..., { ssr: false })` from server layouts/pages.
4. Call `setAuth()` on mount with `publishableKey` (+ optional `idToken`).

Example:

```tsx
// app/components/char-shell-client.tsx
"use client";

import { useEffect, useRef } from "react";
import "@mcp-b/char/shell-component";
import type { CharAgentShellElement } from "@mcp-b/char/shell-component";

export function CharShellClient({ idToken }: { idToken?: string }) {
  const ref = useRef<CharAgentShellElement>(null);

  useEffect(() => {
    ref.current?.setAuth({ publishableKey: "pk_live_...", idToken });
  }, [idToken]);

  return <char-agent-shell ref={ref} panel-width="420" />;
}
```

```tsx
// app/layout.tsx (server component)
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const CharShellClient = dynamic(() => import("./components/char-shell-client").then(m => m.CharShellClient), {
  ssr: false,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <CharShellClient />
      </body>
    </html>
  );
}
```

### SSR-friendly approach (recommended)

Server render your app normally, then hydrate Char on the client only.
This avoids hydration mismatches and still keeps the page SSR-fast.

## Iframe Clarification

`<char-agent>` and `<char-agent-shell>` both host iframe-owned UI.
Customization is done via element attributes, JS API, and CSS variables.
Do not attempt to query widget internals from WebMCP tools.

## Success Criteria

- Embed loads with no console errors
- Agent can send/receive messages
- Pill/panel behavior works as expected
- WebMCP tools are discoverable and callable
- Next.js integrations run client-only without SSR/hydration issues

## References

- [RECIPES.md](references/RECIPES.md) — copy/paste integration patterns
- [PRODUCTION.md](references/PRODUCTION.md) — publishable-key rollout + security checklist
- [CUSTOMIZATION.md](references/CUSTOMIZATION.md) — theming and shell styling
- [TESTING_GUIDE.md](references/TESTING_GUIDE.md) — tool and UI validation flow
- [LIVE_PREVIEW.md](references/LIVE_PREVIEW.md) — CDP preview on live sites

## Usage Examples

- "Set up Char with publishable key on my `index.html` and use shell mode"
- "Add Char to my Next.js app in a client-only component"
- "Configure WebMCP tools and test them with Chrome DevTools MCP"
- "Make the Char pill and panel match our design tokens"
