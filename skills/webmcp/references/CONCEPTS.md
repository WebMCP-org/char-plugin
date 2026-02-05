# WebMCP Concepts

Understanding WHY WebMCP tools work the way they do.

## The Browser as Server

Traditional MCP: A separate process (Node.js, Python) exposes tools via stdio/HTTP.

WebMCP: Your webpage IS the server. Tools live in the browser tab.

**Implications:**
- Tools have DOM access, browser APIs, application state
- Tools can trigger UI updates, navigation, form fills
- AI operates within user's security context
- Tools appear/disappear as user navigates (component lifecycle)

## Why Re-registration Matters

The handler function captures state at registration time:

```js
let count = 5;
const handler = () => console.log(count);  // Captures reference to `count`

count = 10;
handler();  // Logs 10 - the variable updated
```

But the **description** is a string, frozen at registration:

```js
registerTool({
  description: `Counter is ${count}`,  // String "Counter is 5" - frozen!
  execute: handler
});

count = 10;
// Description still says "Counter is 5"
```

To update the description, you must re-register. That's why:
- React: deps array triggers re-registration when values change
- Vanilla JS: manually call unregister/register

## Why Read/Fill

**Problem 1: Tool Proliferation**

Without read/fill:
```
settings_read, settings_fill, settings_submit
```

AI confusion: When read vs fill? Does fill auto-submit? Partial updates how?

**Problem 2: Extra Round Trips**

```
AI: settings_read → { theme: "light" }
AI: settings_fill { theme: "dark" }
AI: settings_read → { theme: "dark" }  // Verify it worked
```

**Problem 3: Partial Updates**

With separate tools, updating one field requires knowing all others:
```
AI: settings_read → { theme: "light", notifications: true }
AI: settings_fill { theme: "dark", notifications: true }  // Must include both
```

**Solution: One Tool, Two Modes**

```
{} → read current state
{ field: value } → merge and save
```

Partial updates work automatically. No verification needed (response confirms).

## Why Input Takes Precedence

React state updates are async:

```js
setTheme(input.theme);  // Schedules update for next render
save({ theme });        // Still has OLD value!
```

The handler runs in the current render. State won't update until next render.

Pattern: `input.field ?? currentField`
- Input provided → use directly
- Input missing → use closure value

## Why Descriptions Include State

Without state:
```
"Configure user settings"
```

AI must call read mode just to know current values.

With state:
```
"Configure user settings. Current: theme=dark, notifications=on"
```

AI already knows. Can decide what to change without extra call.

This is why re-registration matters: description must stay fresh.

## Why Annotations Matter

Hints tell AI how to treat tools:

**readOnlyHint: true**
- "Safe to call freely"
- No user confirmation needed
- Use for: queries, status checks

**idempotentHint: true**
- "Same input → same output"
- Safe to retry
- Use for: lookups, calculations

**destructiveHint: true**
- "Modifies state"
- Consider user confirmation
- Use for: saves, deletes, navigation

## Navigation and Tool Lifecycle

SPA navigation = component unmount/mount:

```
/settings mounted
  → settings_form registered

Navigate to /billing

/settings unmounted
  → settings_form unregistered

/billing mounted
  → billing_form registered
```

That's why:
1. Navigation tool lives at layout level (survives transitions)
2. Navigation is destructive (causes tool unmounting)
3. Page tools are page-scoped (tied to component lifecycle)

## The Trust Model

WebMCP tools run in the browser, not a sandboxed server. They have full access to:
- DOM and page state
- Browser APIs (localStorage, cookies, etc.)
- Application context (auth tokens, user data)

This is powerful but requires trust. The AI operates AS the user, with the same permissions.

## Error Handling: React vs Vanilla JS

MCP errors are signaled via `{ content: [...], isError: true }`.

**Vanilla JS:** You must construct this yourself:
```js
execute: async (input) => {
  if (!input.email) {
    return {
      content: [{ type: "text", text: "Email is required" }],
      isError: true,
    };
  }
}
```

**React (`useWebMCP`):** Just throw - the hook converts it automatically:
```tsx
handler: async (input) => {
  if (!input.email) {
    throw new Error("Email is required");
    // Becomes: { content: [{ type: "text", text: "Email is required" }], isError: true }
  }
}
```

This is a convenience the React hook provides. Under the hood, it catches thrown errors and wraps them in the MCP error format.

## Mental Model Summary

1. **Your app is the server** - Browser exposes tools via `navigator.modelContext`
2. **Lifecycle = component lifecycle** - Tools mount/unmount with components
3. **Handlers capture state** - Via closures, frozen at registration
4. **Re-registration keeps state fresh** - Description + closure update together
5. **Read/fill unifies operations** - One tool, two modes, partial updates
6. **Input wins** - `input.field ?? currentField`
7. **Descriptions are context** - Include current state
8. **Annotations guide AI** - Hints about safety and side effects
9. **Errors: throw in React, return in vanilla** - React hook converts; vanilla JS must format
