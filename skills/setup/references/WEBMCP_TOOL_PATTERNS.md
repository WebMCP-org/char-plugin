# WebMCP Tool Patterns

Best practices for writing WebMCP tools that AI agents can use effectively. These patterns emerge from real-world usage and AI testing.

## Core Concept: How Tool Registration Works

Before diving into patterns, understand the mechanism:

```
┌─────────────────────────────────────────────────────────────┐
│  Your Code                                                  │
│  ┌─────────────────┐      ┌─────────────────────────────┐  │
│  │ Form State      │      │ Tool Registration           │  │
│  │ - idpType       │ ───► │ - name, description         │  │
│  │ - clientId      │      │ - inputSchema               │  │
│  │ - domain        │      │ - handler (captures state)  │  │
│  └─────────────────┘      └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│  navigator.modelContext                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Registered Tools                                     │   │
│  │ - idp_config: { handler, description, schema }       │   │
│  │ - nav_goto: { handler, description, schema }         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key insight:** The handler function captures your current state values at registration time. When state changes, you must re-register the tool to update what the handler sees.

- **React**: The `deps` array controls when re-registration happens
- **Vanilla JS**: Call `unregister()` and re-register when values change

## Tool Categories

Organize tools into three categories:

### 1. Navigation Tool (One Per App)

A single global tool that handles client-side navigation.

**React:**
```tsx
useWebMCP({
  name: "nav_goto",
  description: `Navigate to a different page. Current: ${currentPath}

Pages:
- /app - Dashboard with usage stats
- /billing - Subscription management
- /settings - Organization settings

Note: Navigation unmounts current page tools.`,
  inputSchema: {
    path: z.string().describe("Target path (e.g., '/billing')"),
  },
  annotations: { destructiveHint: true },
  handler: async ({ path }) => {
    navigate({ to: path });
    return { navigated: path };
  },
}, [currentPath, navigate]);
```

**Vanilla JS:**
```js
let navRegistration = null;

function registerNavTool(currentPath, navigate) {
  // Unregister previous if exists
  navRegistration?.unregister();

  navRegistration = navigator.modelContext.registerTool({
    name: "nav_goto",
    description: `Navigate to a page. Current: ${currentPath}

Pages: /app, /billing, /settings`,
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Target path" }
      },
      required: ["path"]
    },
    annotations: { destructiveHint: true },
    execute: async ({ path }) => {
      navigate(path);
      return { content: [{ type: "text", text: `Navigated to ${path}` }] };
    }
  });
}

// Call on route change
router.on("change", (newPath) => registerNavTool(newPath, router.navigate));
```

**Key points:**
- One per app, registered at layout level
- High-level page descriptions (what you can DO, not tool names)
- Mark `destructiveHint: true` (causes tool unmounting)
- Update description with current location

### 2. Read-Only Tools

Tools that gather information without side effects.

```tsx
useWebMCP({
  name: "billing_status",
  description: "Get subscription status, plan, usage, and renewal info.",
  inputSchema: {},
  outputSchema: {
    plan: z.string(),
    usage: z.number(),
    renewalDate: z.string(),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
  },
  handler: async () => {
    const status = await fetchBillingStatus();
    return {
      plan: status.plan,
      usage: status.usage,
      renewalDate: status.renewalDate,
    };
  },
}, []);  // No deps needed - fetches fresh data each call
```

**Key points:**
- Mark `readOnlyHint: true` and `idempotentHint: true`
- Use `outputSchema` for structured responses
- Can call APIs directly (no navigation needed)
- Consider layout-level registration for global access

### 3. Form Tools (The Read/Fill Pattern)

Tools that read and modify form state. This is the core pattern.

```tsx
useWebMCP({
  name: "idp_config",
  description: `Configure identity provider.

Current: ${idpType ?? "not configured"}

Call with no values to read current state.
Call with values to update and save.`,
  inputSchema: {
    idp_type: z.enum(["okta", "auth0", "azure"]).optional(),
    client_id: z.string().optional(),
    domain: z.string().optional(),
  },
  outputSchema: {
    mode: z.enum(["read", "filled"]),
    values: z.record(z.unknown()),
  },
  annotations: { destructiveHint: true },
  handler: async (input) => {
    const hasInput = Object.values(input).some(v => v !== undefined);

    if (!hasInput) {
      // READ MODE: Return current form state
      return {
        mode: "read",
        values: { idp_type: idpType, client_id: clientId, domain },
      };
    }

    // FILL MODE: Merge input with current state, save
    await saveMutation.mutateAsync({
      idp_type: input.idp_type ?? idpType,
      client_id: input.client_id ?? clientId,
      domain: input.domain ?? domain,
    });

    return { mode: "filled", values: input };
  },
}, [idpType, clientId, domain, saveMutation]);
```

## The Read/Fill Pattern Explained

| Mode | Input | Behavior |
|------|-------|----------|
| READ | `{}` | Returns current form state from closure |
| FILL | `{ field: value }` | Merges input with current state, saves |

**Why this pattern?**
1. AI can inspect state before deciding what to change
2. Partial updates work naturally (only specify fields to change)
3. Single tool instead of read/update/submit triplet
4. Mirrors how Claude Code's Edit tool works (read file, then edit)

**The merge logic:**
```tsx
// For each field: use input if provided, otherwise use current state
idp_type: input.idp_type ?? idpType
```

This means:
- `{}` → reads current `idpType`
- `{ idp_type: "okta" }` → uses "okta", ignores current
- `{ client_id: "abc" }` → uses "abc" for client_id, keeps current idp_type

## Why Dependencies Matter

The handler captures state at registration time. Without proper deps, you get stale values:

```tsx
// ❌ WRONG: Empty deps means handler sees initial values forever
const [count, setCount] = useState(0);
useWebMCP({
  handler: async () => {
    return { count };  // Always returns 0!
  },
}, []);  // Never re-registers

// ✅ CORRECT: Include values used in handler
useWebMCP({
  handler: async () => {
    return { count };  // Returns current count
  },
}, [count]);  // Re-registers when count changes
```

**What triggers re-registration:**
- Changes to any value in `deps` array
- Changes to `name` or `description`
- Changes to `inputSchema`/`outputSchema`/`annotations` (by reference)

**What does NOT trigger re-registration:**
- Changes to `handler` function (stored in ref internally)
- Changes to `onSuccess`/`onError` callbacks

## Input Values Take Precedence

Never set state then immediately read it:

```tsx
// ❌ WRONG: State update is async
handler: async (input) => {
  setIdpType(input.idp_type);  // Schedules update
  await saveMutation.mutateAsync({
    idp_type: idpType,  // Still has OLD value!
  });
}

// ✅ CORRECT: Use input directly for mutations
handler: async (input) => {
  await saveMutation.mutateAsync({
    idp_type: input.idp_type ?? idpType,  // Input wins
  });
}
```

The pattern is: **input ?? closure_value**

- If input provided → use it directly
- If input undefined → use value from closure (current state)

## Error Handling

Errors thrown from handlers are caught and returned as error responses:

```tsx
handler: async (input) => {
  try {
    await saveMutation.mutateAsync(input);
    return { mode: "filled", values: input };
  } catch (error) {
    // Option 1: Let it throw (becomes isError: true response)
    throw error;

    // Option 2: Return structured error (still success response)
    return {
      mode: "error",
      error: error.message,
      values: input
    };
  }
}
```

Choose based on whether the AI should retry or handle the error.

## Description Best Practices

### Include Current State

```tsx
description: `Configure IDP. Current: ${idpType ?? "none"}`
```

This updates when deps change, giving AI fresh context.

### Explain Field Requirements

```tsx
description: `Configure identity provider.

Provider types:
- okta: Requires domain (e.g., "dev-123456.okta.com")
- auth0: Requires domain (e.g., "myapp.auth0.com")
- azure: Requires domain (tenant ID)
- google: No domain needed
- custom_oidc: Requires issuer URL`
```

### Don't List Tool Names in Navigation

```tsx
// ❌ Wrong: Tool names may change
"/billing - Tools: billing_status, billing_checkout"

// ✅ Correct: Describe capabilities
"/billing - Manage subscription, view plans, access portal"
```

## Annotation Guidelines

| Annotation | When to Use |
|------------|-------------|
| `readOnlyHint: true` | Tool only reads data, no side effects |
| `idempotentHint: true` | Safe to call multiple times with same result |
| `destructiveHint: true` | Modifies state, user should see/approve |

## When NOT to Use Read/Fill

Sometimes separate tools are better:

1. **Expensive writes with confirmation**: Use separate read and write tools when write needs explicit user confirmation
2. **Complex validation**: When validation depends on multiple fields that must be checked together
3. **Wizard flows**: Multi-step forms where each step has its own tool

## Common Mistakes

### 1. Too Many Tools Per Form

```tsx
// ❌ Wrong: 3 tools for one form
useWebMCP({ name: "form_read", ... });
useWebMCP({ name: "form_fill", ... });
useWebMCP({ name: "form_submit", ... });

// ✅ Correct: One tool with read/fill modes
useWebMCP({ name: "form", ... });
```

### 2. Empty Dependencies

```tsx
// ❌ Wrong: Closure values are stale forever
useWebMCP({ handler: () => save(currentValue) }, []);

// ✅ Correct: Include values used in handler
useWebMCP({ handler: () => save(currentValue) }, [currentValue, save]);
```

### 3. Setting State Before Mutation

```tsx
// ❌ Wrong: State is async
setFormValue(input.value);
await save({ value: formValue });  // Stale!

// ✅ Correct: Use input directly
await save({ value: input.value ?? formValue });
```

### 4. Forgetting outputSchema

```tsx
// ❌ Missing: AI gets unstructured text
handler: async () => ({ plan: "pro", usage: 42 })

// ✅ Better: AI gets typed structured data
outputSchema: {
  plan: z.string(),
  usage: z.number(),
},
handler: async () => ({ plan: "pro", usage: 42 })
```

## Testing Your Tools

Use Chrome DevTools MCP to test as you write:

1. **Test read mode**: Call with `{}`
2. **Test fill mode**: Call with values, verify mutation fires
3. **Check description**: Is current state visible?
4. **Verify deps**: Change state, call again - does it reflect updates?

If Claude can't figure out how to use a tool, improve the description.
