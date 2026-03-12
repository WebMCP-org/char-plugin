# Common Setup Recipes (Publishable Key Model)

Copy/paste recipes for the current Char setup model.

---

## Recipe 1: Fastest Production-Ready Embed (Script Tag + Shell)

**Use when:** You want the default Char UX quickly.

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

Notes:
- `@latest` keeps the embed up to date.
- Shell handles pill/panel/fullscreen behavior automatically.

---

## Recipe 2: Add Per-User Identity

**Use when:** Your app has logged-in users and you want attributed sessions.

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/shell-standalone.iife.js" defer></script>
<char-agent-shell id="char-shell"></char-agent-shell>
<script>
  async function mountChar() {
    const idToken = await getIdTokenForCurrentUser();
    const shell = document.getElementById("char-shell");
    shell?.setAuth({ publishableKey: "pk_live_...", idToken });
  }
  mountChar();
</script>
```

Do not place `idToken` in HTML attributes.

---

## Recipe 3: Low-Level Control with `<char-agent>`

**Use when:** You already own host shell/layout behavior.

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>
<char-agent id="char-agent" publishable-key="pk_live_..."></char-agent>
<script>
  const agent = document.getElementById("char-agent");
  agent?.connect({ publishableKey: "pk_live_..." });
</script>
```

---

## Recipe 4: Next.js Client-Only Embed

**Use when:** App Router/SSR is enabled.

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
// app/layout.tsx
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const CharShellClient = dynamic(() => import("./components/char-shell-client").then(m => m.CharShellClient), { ssr: false });

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

---

## Recipe 5: Register a WebMCP Tool

```ts
import "@mcp-b/global";

navigator.modelContext.registerTool({
  name: "open_support_modal",
  description: "Open the support modal on the current page",
  inputSchema: { type: "object", properties: {} },
  annotations: { destructiveHint: false },
  execute: async () => {
    document.querySelector("[data-support-open]")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return { content: [{ type: "text", text: "Support modal opened" }] };
  },
});
```

---

## Recipe 6: Test Tools with Chrome DevTools MCP

```text
list_webmcp_tools summary=true
call_webmcp_tool name="open_support_modal" arguments={}
```

Validation checklist:
- Tool appears in list
- Tool description is clear
- Tool executes without console errors
- UI reflects expected side effect

---

## Recipe 7: Theme Shell and Agent

```html
<style>
  char-agent-shell {
    --char-color-primary: #2563eb;
    --char-color-background: #ffffff;
    --char-color-foreground: #0f172a;
    --char-color-border: #e2e8f0;
  }
</style>
```

---

## Migration Notes

Legacy patterns to remove:
- `dev-mode`
- `auth-token`
- `clientId`/`organizationId` in `connect()`
- `ticketAuth`

Current contract:
- `publishableKey` required
- `idToken` optional
