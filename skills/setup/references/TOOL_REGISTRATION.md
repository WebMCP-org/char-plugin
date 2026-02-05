# Custom Tool Registration Guide

How to register custom WebMCP tools in your application for the embedded agent to use.

## Critical Understanding

**Tools are registered in the application's source code**, not injected dynamically via scripts.
**MCPB documentation (WebMCP Server) is the source of truth** for API names/signatures. If this guide conflicts, follow the MCPB docs.

## How It Works

1. **Register tools in your host app** using `window.navigator.modelContext.registerTool`
2. **Tools are available immediately** after registration
3. **Progressive disclosure** is achieved by registering tools only on relevant pages
4. **Verify with Chrome DevTools MCP** using `diff_webmcp_tools`

---

## Framework-Agnostic Registration

Install dependencies:

```bash
npm install @mcp-b/global
```

Import the polyfill once in your entry file:

```typescript
import '@mcp-b/global';
```

Example tool (login form):

```typescript
const modelContext = window.navigator?.modelContext;
if (!modelContext?.registerTool) {
  throw new Error('navigator.modelContext.registerTool is not available. Did you import @mcp-b/global first?');
}

modelContext.registerTool({
  name: 'fill_login_form',
  description: 'Fill the login form with credentials',
  inputSchema: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'Username or email' },
      password: { type: 'string', description: 'Password' },
    },
    required: ['username', 'password'],
  },
  execute: async ({ username, password }) => {
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');

    if (!usernameInput || !passwordInput) {
      throw new Error('Login inputs not found');
    }

    usernameInput.value = username;
    passwordInput.value = password;
    return {
      content: [{ type: 'text', text: 'Login inputs filled' }],
    };
  },
});
```

## Progressive Disclosure

Only register tools where they apply:

- **Global tools** (available everywhere): navigation, page snapshot, take screenshot
- **Page-specific tools**: form fill, submit actions

If you use a router, register tools on route/page mount and unregister on unmount.

## Testing with Chrome DevTools MCP

```bash
# See which tools are registered
mcp__chrome-devtools__diff_webmcp_tools()

# Execute a tool
mcp__chrome-devtools__webmcp_localhost_3000_page0_fill_login_form({
  username: "test@example.com",
  password: "password123"
})
```

## Best Practices

- Use clear, semantic names (`fill_login_form`, `submit_login`)
- Throw errors on failure (don’t return `{ success: false }`)
- Avoid DOM selectors inside the widget (Shadow DOM is always enabled; internals are not accessible)
- Prefer stable selectors (`data-test`, `id`) over CSS classes
- Avoid page reloads or full navigations in tool handlers (they unmount tools and the in-page agent); prefer updating UI state or in-app routing.
