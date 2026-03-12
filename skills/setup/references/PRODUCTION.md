# Production Setup Guide (Publishable Key)

Move from setup to production using the current embed contract.

## Auth Contract

- `publishableKey`: required
- `idToken`: optional
- Ticket exchange is handled by the widget runtime

Do not use legacy `dev-mode` or `auth-token` patterns.

## Baseline Production Embed

### Script tag + shell (recommended)

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/shell-standalone.iife.js" defer></script>
<char-agent-shell id="char-shell"></char-agent-shell>
<script>
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("char-shell")?.setAuth({
      publishableKey: "pk_live_...",
    });
  });
</script>
```

### Low-level agent

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>
<char-agent publishable-key="pk_live_..."></char-agent>
```

## Add Per-User Identity

If users are authenticated in your app, attach `idToken` client-side.

```ts
shell.setAuth({ publishableKey: "pk_live_...", idToken });
```

Keep `idToken` out of HTML attributes.

## Next.js / SSR

Use client-only rendering for Char components.

- `'use client'` component for shell/agent
- `dynamic(..., { ssr: false })` at server boundary
- call `setAuth()` in `useEffect`

SSR-friendly approach:
- Server-render the app normally
- Hydrate Char client-side only

## Production Checklist

- [ ] Publishable key created in dashboard
- [ ] Allowed origins/domains configured for key
- [ ] Key is `pk_live_...` for production
- [ ] Optional `idToken` comes from your auth provider at runtime
- [ ] WebMCP tools tested from Chrome DevTools MCP
- [ ] Widget theme variables match product design tokens
- [ ] Key rotation/revocation process documented

## Common Errors

- `MISSING_PUBLISHABLE_KEY`: missing `publishable-key` or `setAuth({ publishableKey })`
- `INVALID_KEY`: key revoked/invalid
- `ORIGIN_NOT_ALLOWED`: origin missing from key allowlist
- `INVALID_TOKEN` / `TOKEN_EXPIRED`: refresh and pass a valid `idToken`

## Security Notes

- Publishable keys are public embed credentials, not secret API keys.
- Restrict key usage with origin/domain allowlists.
- Rotate keys if unexpectedly exposed.
- Pass user identity via `idToken` in JS APIs (`setAuth`/`connect`), not attributes.
