# Example Integration: Cypress RealWorld App (Web Component)

A complete example of integrating Char into a real-world web application using the **web component** (no React UI components).

**Embed Method**: `` web component
**Interface Style**: Widget overlay (Shadow DOM)
**Verified**: This integration pattern was tested via Ralph Loop automation

---

## Why This Is a Good Test Case

**Cypress RealWorld App** (https://github.com/cypress-io/cypress-realworld-app) is ideal because:

1. **Real-world complexity**: Full-stack app with authentication, payments, API, database
2. **Well-structured**: Clear separation of frontend and backend (Express)
3. **Established testing**: Comprehensive Cypress test suite validates integration doesn't break existing functionality
4. **Modern stack**: TypeScript + Vite (representative of current web development)

---

## Integration Checklist

### Pre-Integration

- [ ] Clone repository: `git clone https://github.com/cypress-io/cypress-realworld-app.git test-integration/cypress-realworld-app`
- [ ] Install dependencies: `cd test-integration/cypress-realworld-app && yarn install`
- [ ] Verify builds: `yarn build`
- [ ] Start dev server: `yarn dev`
- [ ] Confirm app runs: Navigate to `http://localhost:3000`
- [ ] Review entry point: `index.html` (confirm this is where widget should be added)
- [ ] Check for existing chat/help widgets: None (clean slate)

### Integration Phase

- [ ] Install dependencies for tool registration (if needed): `yarn add @mcp-b/global`
- [ ] Copy IIFE build into public:
  ```bash
  cp ../../packages/char/dist/web-component-standalone.iife.js public/char-agent.js
  ```
- [ ] Add to `index.html` (before `</body>`):
  ```html
  <script type="module" src="/char-agent.js"></script>
  <char-agent dev-mode='{"anthropicApiKey":"YOUR_KEY"}'></char-agent>
  ```
- [ ] For production, swap to `auth-token`
- [ ] Register page-specific tools with `navigator.modelContext.registerTool`
- [ ] Test widget opens and responds

### Testing Phase (Chrome DevTools MCP)

- [ ] Navigate to `http://localhost:3000`
- [ ] Take snapshot: Verify widget in page structure
- [ ] Click widget: Verify opens
- [ ] Test: "Fill the sign-in form with username 'testuser' and password 'password123'"
- [ ] Verify: Form fields populated
- [ ] Test: "Click the sign-in button"
- [ ] Verify: Navigation to dashboard
- [ ] Test: "Take a screenshot"
- [ ] Verify: Screenshot saved
- [ ] Run Cypress tests: `yarn cypress:open`
- [ ] Verify: Existing tests still pass (widget doesn't break app)

### Post-Integration

- [ ] Document integration in `INTEGRATION_NOTES.md`
- [ ] Take screenshots (collapsed/open/mobile)
- [ ] Check console for errors
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)

---

## Expected Results

```
Widget visible on the page ()
Chat opens and responds
Tools can fill forms and click buttons
No JavaScript errors
Existing Cypress tests pass
```

---

## Potential Challenges

| Challenge | Likelihood | Mitigation |
|-----------|-----------|------------|
| Shadow DOM limitations | Medium | Do not target widget internals; use CSS variables only |
| Tool registration not mounting | Medium | Ensure tools register on the correct pages |
| API key exposure | High | Use .env.local for dev mode keys |

---

## Sample Tool Registration (Host App)

### Login Page Tools

```typescript
// src/pages/SignInPage.tsx
const modelContext = window.navigator?.modelContext;
if (!modelContext?.registerTool) {
  throw new Error('navigator.modelContext.registerTool is not available. Did you import @mcp-b/global first?');
}

modelContext.registerTool({
  name: 'fill_login_form',
  description: 'Fill the sign-in form with credentials',
  inputSchema: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'Username to enter' },
      password: { type: 'string', description: 'Password to enter' },
    },
    required: ['username', 'password'],
  },
  execute: async ({ username, password }) => {
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');

    if (!usernameInput || !passwordInput) {
      throw new Error('Username and password inputs not found');
    }

    usernameInput.value = username;
    passwordInput.value = password;
    return {
      content: [{ type: 'text', text: 'Login form filled' }],
    };
  },
});
```

---

## Style Extraction Example

Extract Material-UI styles using Chrome DevTools MCP:

```typescript
await mcp__chrome-devtools__evaluate_script({
  function: `() => {
    const body = document.body;
    const button = document.querySelector('button[type="submit"]');

    return {
      primary: getComputedStyle(button).backgroundColor,
      background: getComputedStyle(body).backgroundColor,
      foreground: getComputedStyle(body).color,
      radius: getComputedStyle(button).borderRadius,
      fontFamily: getComputedStyle(body).fontFamily
    };
  }`
});
```

Apply as CSS variables:

```html
<style>
  char-agent {
    --char-color-primary: #388e3c;
    --char-color-background: #fafafa;
    --char-color-foreground: #212121;
    --char-radius: 4px;
    --char-font-sans: Roboto, sans-serif;
  }
</style>
```
