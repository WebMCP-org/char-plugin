# Live Preview via Chrome DevTools MCP

Preview Char on a live website without editing that site's source code.

## Goal

- Extract host design tokens
- Inject Char shell script (`@latest`)
- Mount `<char-agent-shell>` with publishable key
- Verify pill/panel placement and styling

## Requirements

- Chrome DevTools MCP available
- A valid `publishableKey` (`pk_live_...` or `pk_test_...`)

## Workflow

### 1) Navigate + baseline screenshot

```text
new_page url="https://example.com"
take_screenshot
```

### 2) Extract host tokens

Use `evaluate_script` to capture colors/fonts from `:root` and `body`.
Map key values to `--char-color-*` and `--char-font-sans`.

### 3) Inject shell bundle

Use `evaluate_script`:

```js
async () => {
  const src = "https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/shell-standalone.iife.js";
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return { registered: !!customElements.get("char-agent-shell") };
}
```

### 4) Inject shell element and theme vars

```js
() => {
  const style = document.createElement("style");
  style.textContent = `
    char-agent-shell {
      --char-color-primary: #2563eb;
      --char-color-background: #ffffff;
      --char-color-foreground: #0f172a;
      --char-color-border: #e2e8f0;
    }
  `;
  document.head.appendChild(style);

  let shell = document.querySelector("char-agent-shell");
  if (!shell) {
    shell = document.createElement("char-agent-shell");
    shell.setAttribute("panel-width", "420");
    document.body.appendChild(shell);
  }

  return { mounted: true };
}
```

### 5) Connect auth

```js
() => {
  const shell = document.querySelector("char-agent-shell");
  shell?.setAuth({ publishableKey: "pk_live_..." });
  return { connected: !!shell };
}
```

### 6) Verify behavior

- pill appears while closed
- panel opens on interaction
- resize to mobile and verify fullscreen mode

```text
take_screenshot
resize_page width=390 height=844
take_screenshot
```

## Notes

- Prefer shell for realistic preview (pill + panel behavior).
- Char UI is iframe-owned. You theme it via CSS variables, not internal DOM selectors.
- If CSP blocks third-party script injection, capture design tokens and provide integration instructions instead of live injection.

## Common Issues

| Issue | Cause | Fix |
|------|-------|-----|
| Shell never appears | Invalid/missing key or fail-closed availability | Use valid publishable key and check console/network logs |
| `ORIGIN_NOT_ALLOWED` | Origin not allowlisted for key | Add target domain to key allowlist |
| Script blocked | CSP disallows CDN script | Use a local/dev sandbox or provide non-injected integration handoff |
| Styles look off | Missing token mapping | Set `--char-color-*` vars based on extracted host values |
