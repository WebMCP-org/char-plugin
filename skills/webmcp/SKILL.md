---
name: webmcp
version: 4.0.0
description: Write WebMCP tools for browser-based AI agents. Use when building tools that let AI interact with web pages - form filling, navigation, data reading, or any browser automation.
---

# WebMCP Tool Development

Opinionated patterns for building tools that let AI agents interact with your web application.

> **Note:** Examples show the pattern shape. For up-to-date syntax, consult the WebMCP documentation MCP server.

## Prerequisites

Install the polyfill that provides `navigator.modelContext`:

```bash
npm install @mcp-b/global
```

Import it **once** in your entry file, **before** any tool registration:

```typescript
import '@mcp-b/global';
```

After this, `navigator.modelContext.registerTool(...)` is available globally. The Char embedded agent (`<char-agent>`) renders inside Shadow DOM — your tools cannot target elements inside the widget. Treat it as a black box.

---

## Tier 1: Rules That Cause Bugs

These aren't preferences. Violating them produces bugs that are hard to diagnose.

### 1. Input Always Wins

React state updates are async. If you set state then read it in the same handler, you get the old value.

```tsx
// BUG: state update is async, save reads stale value
setTheme(input.theme);
await save({ theme });        // Still the OLD theme!

// CORRECT: use input directly, fall back to closure
await save({ theme: input.theme ?? currentTheme });
```

The pattern is always: `input.field ?? closureValue`

### 2. Description Is a Frozen String

The description is captured as a string at registration time. It does not update when your state changes.

```js
registerTool({
  description: `Counter is ${count}`,  // Frozen as "Counter is 5"
  execute: handler
});
count = 10;
// Description still says "Counter is 5"
```

To update it, re-register the tool:
- **React:** Include the values in the deps array
- **Vanilla JS:** Call `unregister()` then register again

Re-register on **meaningful** state changes (selected provider, plan type), not on every keystroke.

### 3. Navigation Tool Lives at Layout Level

Page-level tools unmount when the user navigates away. The navigation tool must survive page transitions — register it at your root layout, not inside a page component.

### 4. Mark Mutations `destructiveHint: true`

Any tool that modifies state (saves, deletes, navigates) should be annotated `destructiveHint: true`. This tells the AI agent to treat the action with appropriate caution.

```tsx
annotations: { destructiveHint: true }
```

Forgetting this means the AI may call destructive tools without prompting the user.

---

## Tier 2: Patterns That Work

### Read/Fill (One Tool for Forms)

One tool handles both reading and writing:

- `{}` → read current state
- `{ field: value }` → merge with current, save

All input fields are `.optional()`. Partial updates just work.

```tsx
useWebMCP({
  name: "idp_config",
  description: `Configure identity provider. Current: ${idpType ?? "not configured"}

Call with no values to read. Call with values to update and save.`,
  inputSchema: {
    idp_type: z.enum(["okta", "auth0", "google"]).optional(),
    client_id: z.string().optional(),
    domain: z.string().optional(),
  },
  annotations: { destructiveHint: true },
  handler: async (input) => {
    const hasInput = Object.values(input).some(v => v !== undefined);
    if (!hasInput) {
      return { mode: "read", values: { idp_type: idpType, client_id: clientId, domain } };
    }
    await saveMutation.mutateAsync({
      idp_type: input.idp_type ?? idpType,
      client_id: input.client_id ?? clientId,
      domain: input.domain ?? domain,
    });
    return { mode: "filled", values: input };
  },
}, [idpType, clientId, domain, saveMutation]);
```

Best for: Simple forms, backend-only state, when user doesn't need to see changes before save. See [PATTERNS.md](references/PATTERNS.md) for React + Vanilla JS examples.

### Fill/Submit (Two Tools for Visible Staging)

Separate tools for staging vs committing, like `git add` then `git commit`:

- **Fill tool** (idempotent): Updates form fields visually, no backend changes
- **Submit tool** (destructive): Saves current form state to backend

```
idp_form { idp_type: "okta", domain: "..." }  → Form updates visually
idp_submit {}                                   → Saves to backend
```

The user sees what will happen before it happens. AI can iterate (fill, adjust, fill again) without side effects.

Best for: Complex forms where the user should verify changes before save. See [PATTERNS.md](references/PATTERNS.md) for a complete example.

### State in Descriptions

```
"Configure user settings. Current: theme=dark, notifications=on"
```

AI knows the state without calling read mode. Fewer round trips.

Be selective — include values the AI needs for decisions (current provider, active plan), not every form field.

### One Navigation Tool

One per app, registered at root layout. Describes **what you can do** on each page, not which tools exist.

```
Navigate to a different page. Current: /settings

Pages:
- /dashboard - View metrics and quick actions
- /settings - Configure account and preferences
- /billing - Manage subscription and payment
```

Start with `path: z.string()` as your input. Expose more router options (params, search, hash, replace) when you actually need them.

### Read-Only Tools

Fetch data the AI needs to make decisions. Mark `readOnlyHint: true` and `idempotentHint: true`. No deps needed if fetching fresh each call. Can register at layout level for cross-page access.

### Action Tools

One-shot operations with side effects (send invite, deploy, export). Required fields (no `.optional()`), `destructiveHint: true`, return confirmation with IDs or status.

Don't create action tools for things that should be form fields. If you're building `set_theme` as an action, it belongs in a settings form tool.

---

## Tier 3: Scaling Advice

### Thin Wrappers Over Page Functions

When your page already has form handling, validation, and save logic — the WebMCP hook should just wire into it:

```tsx
// Good: hook calls existing page function
handler: async (input) => {
  updateForm(input);        // Page function handles state + validation
  return { filled: true };
}

// Bad: logic duplicated in hook
handler: async (input) => {
  setIdpType(input.idp_type);
  setClientId(input.client_id);
  toast.info("Form updated");  // Side effect in hook
  await validateAndSave();     // Business logic in hook
}
```

The page owns state, validation, mutations, and side effects (toasts, redirects). The hook just provides tool metadata and wiring.

This only applies when clean page functions exist to call. For simple tools, inline logic is fine.

### Component-Scoped vs Global Tools

- **Page-level tools** mount/unmount with the page component (progressive disclosure)
- **Layout-level tools** survive navigation (nav tool, billing status)

Don't register too many global tools — it clutters the tool list.

### `outputSchema`

Typed responses help AI parse results reliably:

```tsx
outputSchema: {
  plan: z.string(),
  usage: z.number(),
  renewalDate: z.string(),
},
```

Not required, but useful for read-only and status tools.

---

## Quick Decisions

**Should this be a tool?**
- Can the AI do it via existing browser automation? → No tool needed
- Does it require app-specific state or logic? → Make a tool

**Read-only or read/fill?**
- Just fetching data? → Read-only with `readOnlyHint: true`
- Form with state? → Read/fill

**Page-level or layout-level?**
- Needs to survive navigation? → Layout
- Specific to one page? → Page

**Read/Fill or Fill/Submit?**
- Simple form, backend-only state → Read/Fill (one tool)
- User should see changes before save → Fill/Submit (two tools)

---

## Common Mistakes

1. **Empty deps array with state in handler** → Stale closures forever
2. **Setting state then reading it** → Async timing bug (use input ?? closure)
3. **Multiple separate tools per form** → Use read/fill or fill/submit instead
4. **Listing tool names in nav description** → Brittle; describe capabilities
5. **Forgetting `destructiveHint`** → AI may call without user awareness
6. **UI state in tool design** → AI doesn't care about "edit mode," it wants read/write
7. **Logic in hooks when page functions exist** → Duplicate code, use thin wrappers
8. **Toasts in hooks** → Page already handles user feedback

---

## Testing with Chrome DevTools MCP

Test WebMCP tools directly from Claude Code using the Chrome DevTools MCP. **Dogfood your tools as you build them** - if you can't figure out how to use a tool, neither will the AI agent.

### Setup

1. Start your app locally (e.g., `pnpm dev` on port 3000)
2. Open Chrome with the DevTools extension connected
3. Navigate to the page with your WebMCP tools

### Listing Tools

```
list_webmcp_tools                           # Selected page only (default)
list_webmcp_tools summary=true              # Compact view - names + first line only
list_webmcp_tools pattern="skill*"          # Filter by name pattern
list_webmcp_tools all_pages=true            # All open tabs
list_webmcp_tools page_index=0              # Specific tab by index
```

**Start with `summary=true`** to see what's available, then drill into specific tools.

### Calling Tools

```
call_webmcp_tool name="x" arguments={}      # Read mode (empty object)
call_webmcp_tool name="x" arguments={...}   # Fill mode (with values)
```

### Dogfooding Workflow

When building a new WebMCP tool, test it immediately:

**1. Verify registration:**
```
list_webmcp_tools pattern="my_new*" summary=true
```
Tool should appear with correct name. If missing, check component mounted.

**2. Check the description:**
```
list_webmcp_tools pattern="my_new_tool"
```
Read the full description. Is the current state shown? Are the modes clear?

**3. Test read mode:**
```
call_webmcp_tool name="my_new_tool" arguments={}
```
Should return current state. Verify the shape matches what AI needs.

**4. Test fill mode:**
```
call_webmcp_tool name="my_new_tool" arguments={"field": "value"}
```
Should save and return confirmation. Check the UI updated.

**5. Verify persistence:**
```
call_webmcp_tool name="my_new_tool" arguments={}
```
Read again - filled values should be reflected.

**6. Test error cases:**
```
call_webmcp_tool name="my_new_tool" arguments={"field": "invalid"}
```
Should return helpful error message, not crash.

### Page Navigation

Tools are page-scoped. Navigate and verify tools change:

```
list_pages                                  # See open tabs with indices
navigate_page type="url" url="http://localhost:3000/settings"
list_webmcp_tools summary=true              # Different tools now available
```

### Debugging

**Tool not appearing?**
- Page fully loaded? (registration happens after mount)
- Component with `useWebMCP` rendered?
- Check browser console for errors
- Try `list_webmcp_tools all_pages=true` to see if it's on wrong page

**Stale description?**
- State values in deps array?
- Force re-render and check again

**Tool call failing?**
- Use `list_webmcp_tools pattern="tool_name"` to see exact schema
- Check `page_index` if multiple tabs open

### Quality Checklist

Before shipping a WebMCP tool, verify:

- [ ] **Description shows current state** - `"Current: theme=dark"`
- [ ] **Fields are documented** - `"domain: Provider domain (e.g., 'dev-123.okta.com')"`
- [ ] **Errors are helpful** - AI can fix the input based on error message
- [ ] **Description updates** - Re-register when state changes
- [ ] **Thin wrapper** - Hook just calls page functions, no duplicate logic

**For Read/Fill tools:**
- [ ] **Read mode works** - `{}` returns current state
- [ ] **Fill mode works** - `{ field: value }` saves and confirms

**For Fill/Submit tools:**
- [ ] **Fill updates UI** - Form fields change visually
- [ ] **Fill is idempotent** - Can call multiple times safely
- [ ] **Submit persists** - Only backend change happens on submit
- [ ] **Submit is destructive** - Marked with `destructiveHint: true`

---

## References

| Doc | What It Covers |
|-----|----------------|
| [CONCEPTS.md](references/CONCEPTS.md) | Why patterns work (closures, lifecycle, philosophy) |
| [PATTERNS.md](references/PATTERNS.md) | Detailed examples for each tool type with React + Vanilla JS |

For API reference (parameters, types, return values), use the WebMCP docs MCP server.
