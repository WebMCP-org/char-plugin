---
name: webmcp
version: 1.0.0
description: Write WebMCP tools for browser-based AI agents. Use when building tools that let AI interact with web pages - form filling, navigation, data reading, or any browser automation.
---

# WebMCP Tool Development

Opinionated patterns for building tools that let AI agents interact with your web application.

> **Note:** Examples show the pattern shape. For up-to-date syntax, consult the WebMCP documentation MCP server.

## The Three Tool Types

Every web app needs these:

| Type | Count | Where | Purpose |
|------|-------|-------|---------|
| **Navigation** | One | Layout | Route between pages |
| **Read-Only** | Few | Layout or Page | Fetch data |
| **Form (Read/Fill)** | Many | Page | Read and modify state |

## Core Patterns

### 1. One Navigation Tool Per App

Register at your root layout. Describes WHAT you can do on each page, not which tools exist.

```
✅ "/billing - Manage subscription, view invoices"
❌ "/billing - Tools: billing_form, invoice_list"
```

Tool names change. Capabilities don't.

**Key principles (framework-agnostic):**

| Concern | Do This | Not This |
|---------|---------|----------|
| **Read path** | `window.location.pathname` | Router state hooks/subscriptions |
| **Navigate** | Your framework's navigate function | — |
| **Registration** | Once, at a stable component/module | Re-register on route changes |

**Why `window.location`?** It's a browser API that works everywhere and always returns the current value. Router state hooks (React's `useLocation`, Angular's `ActivatedRoute`, Vue's `useRoute`) cause re-renders or subscriptions that can interfere with tool execution.

**Framework examples:**

```tsx
// The read is always the same (browser API)
const previousPath = window.location.pathname;

// The write uses your framework's router:
navigate(path);                      // React Router, TanStack Router
router.push(path);                   // Next.js, Vue Router
this.router.navigate([path]);        // Angular
history.pushState({}, '', path);     // Vanilla JS
```

**Registration patterns:**

```tsx
// React - register in a layout component, empty deps
useWebMCP({ name: "nav_goto", handler, ... }, []);

// Vanilla JS - register once at app init
const unregister = webmcp.registerTool({ name: "nav_goto", handler, ... });

// Angular - register in a service, not a component
@Injectable({ providedIn: 'root' })
export class WebMCPService { ... }
```

**Expose the full router API:**

The tool's input schema should mirror your router's navigate options. The AI agent needs full access to navigate anywhere in the app - paths, params, query strings, hash, replace vs push, etc.

```tsx
// ❌ Too limited - just a path string
inputSchema: { path: z.string() }

// ✅ Full router API - agent can navigate anywhere
inputSchema: {
  to: z.string().describe("Route path"),
  params: z.record(z.string()).optional().describe("Route params, e.g. { userId: '123' }"),
  search: z.record(z.unknown()).optional().describe("Query params, e.g. { tab: 'billing', page: 2 }"),
  hash: z.string().optional().describe("Hash fragment"),
  replace: z.boolean().optional().describe("Replace history instead of push"),
}

// Handler passes options directly to router
handler: async (options) => {
  const previousPath = window.location.pathname;
  navigate(options);  // Full options object to router
  return { previousPath, navigatedTo: options };
}
```

**Document everything in the description:**

```
Navigate anywhere in the app.

Options (mirrors router API):
- to: Route path ("/settings", "/users/$userId")
- params: Route params ({ userId: "123" })
- search: Query params ({ tab: "billing", page: 2 })
- hash: Hash fragment ("#section")
- replace: Replace history instead of push

Examples:
- Simple: { to: "/settings" }
- With params: { to: "/users/$userId", params: { userId: "123" } }
- With query: { to: "/search", search: { q: "hello", filter: "active" } }
- Replace: { to: "/login", replace: true }
```

The agent gets the same navigation power as your app's code.

### 2. Form Tool Patterns

Two patterns for forms, choose based on user visibility needs:

#### Read/Fill (One Tool)

One tool handles both reading and writing:

- `{}` → read current state
- `{ field: value }` → merge with current, save

Best for: Simple forms, backend-only state, when user doesn't need to see changes before save.

#### Fill/Submit (Two Tools)

Separate tools for staging vs committing:

- **Fill tool** (idempotent): Updates form visually, no backend changes
- **Submit tool** (destructive): Saves current form state to backend

Best for: Complex forms where user should see/verify changes before saving. Like git staging.

```
idp_form { idp_type: "okta", domain: "..." }  → Form updates visually
form_submit {}                                  → Saves to backend
```

The user sees what will happen before it happens. AI can iterate (fill, adjust, fill again) without side effects.

### 3. Current State in Description

```
"User settings. Current: theme=dark, notifications=on"
```

AI knows the state without calling read mode. Fewer round trips.

### 4. Input Takes Precedence

```tsx
// ✅ Correct
await save({ theme: input.theme ?? currentTheme });

// ❌ Wrong - state update is async
setTheme(input.theme);
await save({ theme });  // Still old value!
```

### 5. Re-register on State Change

The description is frozen at registration. When state changes, re-register to update it.

- React: Include values in deps array
- Vanilla JS: Call unregister/register manually

### 6. Thin Wrappers (Keep Logic in Page)

WebMCP hooks should be **thin wrappers** over existing page logic:

```tsx
// ✅ Good - hook just calls page functions
handler: async (input) => {
  updateForm(input);        // Page function handles state
  return { filled: true };
}

// ❌ Bad - logic duplicated in hook
handler: async (input) => {
  setIdpType(input.idp_type);
  setClientId(input.client_id);
  toast.info("Form updated");  // Side effect in hook
  await validateAndSave();     // Business logic in hook
}
```

**Why thin wrappers:**

1. **Single source of truth** - Page already has the logic for human users
2. **Maintainability** - Change once, AI and human get same behavior
3. **Schema reuse** - Use existing validation (React Hook Form, Zod)
4. **No duplicate side effects** - Page owns toasts, the hook doesn't add more

**The hook provides:**
- Tool name and description
- Annotations (idempotent, destructive hints)
- Input/output schema
- Wiring to page functions

**The page provides:**
- Form state and setters
- Validation logic
- Mutation/save functions
- Side effects (toasts, redirects)

## Documentation

| Doc | What It Covers |
|-----|----------------|
| [CONCEPTS.md](references/CONCEPTS.md) | Why patterns work (closures, lifecycle, philosophy) |
| [PATTERNS.md](references/PATTERNS.md) | Detailed patterns for each tool type |

For API reference (parameters, types, return values), use the WebMCP docs MCP server.

## Quick Decisions

**Should this be a tool?**
- Can the AI do it via existing browser automation? → No tool needed
- Does it require app-specific state or logic? → Make a tool

**Read-only or read/fill?**
- Just fetching data? → Read-only with `readOnlyHint: true`
- Form with state? → Read/fill pattern

**Page-level or layout-level?**
- Needs to survive navigation? → Layout
- Specific to one page? → Page

**Read/Fill or Fill/Submit?**
- Simple form, backend-only state → Read/Fill (one tool)
- User should see changes before save → Fill/Submit (two tools)
- Complex multi-step form → Fill/Submit (iterate without side effects)

## Common Mistakes

1. **Empty deps array** → Stale closures forever
2. **Setting state then reading it** → Async timing bug
3. **Multiple tools per form** → Confusing, use read/fill or fill/submit
4. **Listing tool names in nav description** → Brittle, describe capabilities
5. **Forgetting to mark destructive** → AI may call without user awareness
6. **UI state in tool design** → AI doesn't care about "edit mode," it wants read/write
7. **Logic in hooks** → Duplicate code, use thin wrappers that call page functions
8. **Toasts in hooks** → Redundant, the visual feedback IS the feedback

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
