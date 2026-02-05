# Live Preview via CDP Injection

Preview what Char looks like on any live website — without touching their codebase. Uses Chrome DevTools MCP to extract styles, inject the Char IIFE bundle, and build a themed collapsible sidebar.

**Requires:** Chrome DevTools MCP server

---

## When to Use

- **Sales demos**: "Here's what Char looks like on your site"
- **Customer onboarding**: Extract exact design tokens before writing integration code
- **Design verification**: Test light/dark mode theming on the real page
- **Quick prototyping**: See the sidebar layout before committing to code changes

---

## Step-by-Step Workflow

### Step 1: Navigate and Screenshot

```
mcp__chrome-devtools__new_page({ url: "https://example.com/dashboard" })
mcp__chrome-devtools__take_screenshot()
```

Orient yourself — understand the layout before injecting anything.

### Step 2: Extract CSS Custom Properties

Run via `evaluate_script` to pull design tokens from `:root`:

```js
() => {
  const root = getComputedStyle(document.documentElement);
  const vars = [
    '--primary', '--primary-foreground',
    '--background', '--foreground',
    '--card', '--card-foreground',
    '--muted', '--muted-foreground',
    '--border', '--input', '--ring',
    '--sidebar', '--sidebar-foreground',
    '--accent', '--accent-foreground',
    '--destructive', '--radius',
  ];
  const result = {};
  vars.forEach(v => { result[v] = root.getPropertyValue(v).trim() });
  return result;
}
```

**For dark mode:** Toggle the site's dark mode (find and click their toggle button), then run the same script again.

**Tip:** If their variables use OKLCH, you can map them directly to `--char-*` variables — no color space conversion needed.

### Step 3: Extract Fonts

```js
() => {
  const cs = getComputedStyle(document.body);
  return {
    fontFamily: cs.fontFamily,
    monoFont: getComputedStyle(
      document.querySelector('code') || document.body
    ).fontFamily,
  };
}
```

### Step 4: Map the DOM Structure

Understand the layout before injecting — find the outermost flex container:

```js
() => {
  function describeEl(el, depth = 0) {
    if (depth > 3) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      classes: el.className?.substring?.(0, 80) || '',
      display: cs.display,
      position: cs.position,
      width: cs.width,
      flexDirection: cs.flexDirection,
      childCount: el.children.length,
      children: depth < 2
        ? Array.from(el.children).slice(0, 6).map(c => describeEl(c, depth + 1))
        : undefined,
    };
  }
  return describeEl(document.getElementById('root') || document.body.children[0]);
}
```

**What you're looking for:** The outermost `display: flex` container. The Char sidebar will become a flex sibling of their existing content.

### Step 5: Check CSP

The Content Security Policy determines how you can load the bundle:

```js
async () => {
  const r = await fetch('/');
  return r.headers.get('content-security-policy');
}
```

Key directives to check:
- `script-src` — does it allow `unsafe-eval`? (needed for the `eval()` approach)
- `connect-src` — does it allow `https:`? (needed to fetch the bundle)

### Step 6: Fetch the Char IIFE Bundle

**Use jsdelivr** (not unpkg — unpkg has CORS issues on `@latest` redirects):

```js
async () => {
  const r = await fetch(
    'https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.min.js'
  );
  const text = await r.text();
  window.__charCode = text;
  return { ok: true, size: text.length };
}
```

Then eval it in a **separate** `evaluate_script` call (splitting avoids timeout on the ~2MB bundle):

```js
() => {
  eval(window.__charCode);
  return { registered: !!customElements.get('char-agent') };
}
```

### Step 7: Inject CSS Variables

Map the extracted design tokens to `--char-*` variables:

```js
() => {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --char-color-primary: /* extracted --primary */;
      --char-color-background: /* extracted --card or --background */;
      --char-color-foreground: /* extracted --foreground */;
      --char-color-primary-foreground: /* extracted --primary-foreground */;
      --char-color-muted: /* extracted --muted */;
      --char-color-muted-foreground: /* extracted --muted-foreground */;
      --char-color-border: /* extracted --border */;
      --char-color-input: /* extracted --input */;
      --char-color-ring: /* extracted --ring or --primary */;
      --char-color-error: /* extracted --destructive */;
      --char-radius: /* extracted --radius */;
      --char-font-sans: /* extracted fontFamily */;
      --char-font-mono: /* extracted monoFont */;
    }
    .dark {
      /* dark mode overrides — same variables with dark values */
    }
  `;
  document.head.appendChild(style);
  return 'css injected';
}
```

### Step 8: Build the Collapsible Sidebar DOM

The sidebar is a **flex sibling** of the app's main content — not a fixed overlay. This pushes content left when opened.

```js
() => {
  // Find the app shell (outermost flex container)
  const appShell = document.querySelector('.flex.h-screen.w-full')
    || document.querySelector('[class*="flex"]');
  appShell.style.overflow = 'hidden';

  // Create the collapsible panel
  const panel = document.createElement('div');
  panel.id = 'char-panel';
  panel.style.cssText = `
    flex-shrink: 0;
    overflow: hidden;
    border-left: 1px solid transparent;
    transition: width 0.2s ease-out;
    width: 0;
    background: var(--background);
  `;

  // Inner container stays at 420px (prevents re-layout during animation)
  const inner = document.createElement('div');
  inner.style.cssText = 'width: 420px; height: 100%;';

  // Create the web component
  const agent = document.createElement('char-agent');
  agent.style.cssText = 'display: block; width: 100%; height: 100%;';

  inner.appendChild(agent);
  panel.appendChild(inner);
  appShell.appendChild(panel);

  // Create toggle button
  const btn = document.createElement('button');
  btn.id = 'char-toggle';
  btn.style.cssText = `
    position: fixed; right: 16px; bottom: 16px; z-index: 40;
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--primary); color: var(--primary-foreground);
    border: none; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
  document.body.appendChild(btn);

  // Wire up toggle
  btn.addEventListener('click', () => {
    panel.style.width = '420px';
    panel.style.borderColor = 'var(--border)';
    btn.style.display = 'none';
  });
  document.addEventListener('char-close', () => {
    panel.style.width = '0';
    panel.style.borderColor = 'transparent';
    btn.style.display = 'flex';
  });

  return 'sidebar injected';
}
```

**Why flex sibling, not fixed overlay:**
- Content pushes left — no z-index fights, no hidden content
- Matches the standard Char integration pattern (collapsible sidebar)
- Gives a realistic preview of what the final integration looks like

### Step 9: Activate the Widget

For dev mode (requires Anthropic API key):

```js
() => {
  const agent = document.querySelector('char-agent');
  agent.setAttribute('dev-mode', JSON.stringify({
    anthropicApiKey: 'sk-ant-...'
  }));
  agent.setAttribute('open', 'true');
  return 'dev-mode set';
}
```

For production auth (if you have an IDP token):

```js
() => {
  const agent = document.querySelector('char-agent');
  agent.connect({ idToken: '...', clientId: '...' });
  return 'connected';
}
```

### Step 10: Open and Screenshot

```js
() => { document.getElementById('char-toggle').click(); return 'opened'; }
```

```
mcp__chrome-devtools__take_screenshot()
```

Toggle dark mode and screenshot again to verify both themes.

---

## Collapsible Sidebar Pattern

The recommended integration pattern docks Char as a right sidebar that pushes content:

```
div.flex.h-screen.w-full.overflow-hidden  (app shell)
├── div.flex.min-w-0.flex-1               (existing content)
│   ├── sidebar
│   ├── main content
│   └── etc.
├── div#char-panel.shrink-0.overflow-hidden (agent panel — 420px / 0px)
│   └── div (inner 420px)
│       └── char-agent
└── button#char-toggle.fixed              (toggle — only when closed)
```

**Key rules:**
1. **Flex sibling** — the agent panel must be a direct sibling of the main content, not nested inside it
2. **`shrink-0`** — prevents the panel from being compressed by flex
3. **`overflow-hidden`** on the app shell — prevents horizontal scrollbar during the width transition
4. **Inner div at 420px** — prevents re-layout of the Char UI during the collapse animation
5. **Width transition** — animate between `width: 420px` (open) and `width: 0` (closed)

---

## Gotchas

| Issue | Cause | Fix |
|-------|-------|-----|
| `Failed to fetch` from unpkg.com | CORS headers stripped on `@latest` redirect | Use jsdelivr instead |
| Script timeout on large eval | ~2MB IIFE in one `evaluate_script` call | Split into fetch + eval in two separate calls |
| Widget stuck on "Authenticating" | No auth token or API key provided | Set `dev-mode` attribute with API key, or call `connect()` with idToken |
| Widget stuck on "Loading thread" | Anonymous WebSocket 404 | Anonymous devMode is localhost-only; production needs real SSO auth |
| `connect({ anthropicApiKey })` doesn't work | `connect()` is for SSO only (idToken/ticketAuth) | Use `setAttribute('dev-mode', JSON.stringify({ anthropicApiKey: '...' }))` instead |
| Panel visible but empty | Shadow DOM renders on a child `<div>`, not the `<char-agent>` element itself | Check `agent.children[0].shadowRoot` not `agent.shadowRoot` |
| Flex layout breaks when Char is inside content | Char's `:host` sets `width: 100%; height: 100%` | Put it in its own flex sibling with `shrink-0`, never inside the content area |
| CDP click timeout on toggle button | `Locator.click` timed out | Use `evaluate_script` to call `btn.click()` directly |

---

## Summary Checklist

1. Screenshot the page
2. Extract CSS vars (light + dark)
3. Extract fonts
4. Map the DOM tree to find the flex shell
5. Check CSP
6. Fetch bundle from jsdelivr → `window.__charCode`
7. `eval(window.__charCode)`
8. Inject `--char-*` CSS variables
9. Build sidebar DOM (panel + toggle button)
10. Set `dev-mode` attribute or call `connect()`
11. Click toggle, screenshot, verify both themes

---

## Generating the Setup Document

After a successful live preview, generate a customer-facing setup document that includes:

1. **npm install command** — `npm install @mcp-b/char`
2. **React component code** — collapsible sidebar pattern with `<Char>` component
3. **CSS variables** — the exact `--char-*` values extracted from their site (light + dark)
4. **Layout diagram** — their specific DOM structure with the agent panel placement
5. **Color mapping table** — which of their CSS vars maps to which Char var

This document gives the customer everything they need to integrate Char into their codebase.
