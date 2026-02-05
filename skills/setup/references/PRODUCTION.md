# Production Setup Guide

Move from stateless devMode to production using `auth-token`.

---

## Dev/Test vs Production

### Dev Mode (Stateless)

```html
<char-agent dev-mode='{"anthropicApiKey":"sk-ant-..."}'></char-agent>
```

**Characteristics:**
- ✅ Quick setup
- ✅ No backend setup required
- ✅ Full WebMCP tools
- ❌ No thread persistence
- ❌ No user tracking
- ❌ Not suitable for production

### Production Mode (auth-token)

```html
<char-agent auth-token="USER_IDP_TOKEN"></char-agent>
```

**Characteristics:**
- ✅ Persistent threads
- ✅ User-level tracking
- ✅ No provider API keys in client code

**Important:** The `auth-token` must be injected at runtime from your auth provider - it's not a static string!

---

## Integration Examples

### Vanilla JavaScript (CDN)

```html
<!-- Load widget and declare element -->
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>
<char-agent id="chat-widget"></char-agent>

<script>
  // Set token when user authenticates
  yourAuth.onAuthStateChanged(async function(user) {
    if (user) {
      var token = await yourAuth.getIdToken();
      document.getElementById('chat-widget').setAttribute('auth-token', token);
    }
  });
</script>
```

### React + Okta

```tsx
import '@mcp-b/char/web-component';
import { useOktaAuth } from '@okta/okta-react';

function ChatWidget() {
  const { authState } = useOktaAuth();

  if (!authState?.isAuthenticated || !authState.idToken) {
    return null;
  }

  return (
    <char-agent
      auth-token={authState.idToken.idToken}
    />
  );
}
```

### React + Auth0

```tsx
import '@mcp-b/char/web-component';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

function ChatWidget() {
  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    if (isAuthenticated) {
      getIdTokenClaims().then(claims => {
        if (claims?.__raw) setToken(claims.__raw);
      });
    }
  }, [isAuthenticated, getIdTokenClaims]);

  if (!token) return null;

  return <char-agent auth-token={token} />;
}
```

### Generic Pattern

```ts
import '@mcp-b/char/web-component';

// In your HTML: <char-agent id="chat-widget"></char-agent>

// Set token when user authenticates
yourAuth.onAuthStateChanged(async (user) => {
  if (user) {
    const token = await yourAuth.getIdToken();
    document.getElementById('chat-widget')?.setAttribute('auth-token', token);
  }
});
```

---

## Migration Path

### Step 1: Configure Your IDP

- Set up your Identity Provider (Okta, Auth0, Azure AD, etc.) in the Char dashboard
- Configure the JWKS endpoint and issuer URL

### Step 2: Get the Token at Runtime

- Use your auth provider's SDK to get the user's ID token
- The token must be a valid JWT with a `sub` claim

### Step 3: Pass the Token to the Widget

```tsx
// The token comes from your auth system, not hardcoded!
<char-agent auth-token={session.idToken} />
```

### Step 4: Remove devMode

- Remove `dev-mode` and any client-side Anthropic/OpenAI keys
- Production uses your auth token for identity

### Step 5: Verify Persistence

- Reload the page and confirm the same thread history
- Verify the user identity matches your auth system

---

## Voice Mode

Voice mode is only enabled in devMode via `openaiApiKey`. Production voice configuration is not exposed via the web component at this time.

---

## Troubleshooting

**401 / Invalid token**
- Confirm `auth-token` is a valid JWT from your configured IDP
- Check that the token hasn't expired
- Verify the JWKS endpoint is accessible

**Widget doesn't appear**
- Ensure the user is authenticated before creating the widget
- Check browser console for errors

**No persistence**
- Ensure `auth-token` is present
- Ensure you are not passing `dev-mode`

---

## Summary

- **Dev/Test**: `dev-mode` with Anthropic API key
- **Production**: `auth-token` from your IDP (injected at runtime)
- **Never** ship dev-mode API keys to production clients
- The token must come from your auth provider dynamically - don't hardcode it!
