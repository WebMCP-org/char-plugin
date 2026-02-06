# WebMCP Tool Patterns

Detailed examples for each tool type. Examples show the pattern shape; consult the WebMCP docs MCP server for up-to-date syntax.

## Navigation Tool

**Purpose:** Let AI navigate your SPA without using browser automation clicks.

**Rules:**
1. One per app, registered at root layout
2. Survives page transitions (it's what causes them)
3. Description lists pages by CAPABILITY, not by tool names
4. Mark `destructiveHint: true` - navigation unmounts page tools

**Description template:**
```
Navigate to a different page. Current: {currentPath}

Pages:
- /dashboard - View metrics and quick actions
- /settings - Configure account and preferences
- /billing - Manage subscription and payment

Note: Navigation unmounts current page tools.
```

**Example (React):**
```tsx
function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useWebMCP({
    name: "nav_goto",
    description: `Navigate to a different page. Current: ${location.pathname}

Pages:
- /app - Dashboard with usage stats and quick actions
- /billing - Manage subscription and payment methods
- /settings - Organization settings and team management

Note: Navigation unmounts current page tools.`,
    inputSchema: {
      path: z.string().describe("Target path (e.g., '/billing')"),
    },
    annotations: { destructiveHint: true },
    handler: async ({ path }) => {
      navigate(path);
      return { navigated: path };
    },
  }, [location.pathname, navigate]);

  return <Outlet />;
}
```

**Example (Vanilla JS):**
```js
let navRegistration = null;

function registerNavTool(currentPath) {
  navRegistration?.unregister();

  navRegistration = navigator.modelContext.registerTool({
    name: "nav_goto",
    description: `Navigate to a different page. Current: ${currentPath}

Pages:
- /app - Dashboard with usage stats and quick actions
- /billing - Manage subscription and payment methods
- /settings - Organization settings and team management

Note: Navigation unmounts current page tools.`,
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Target path (e.g., '/billing')" }
      },
      required: ["path"]
    },
    annotations: { destructiveHint: true },
    execute: async ({ path }) => {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return { content: [{ type: "text", text: JSON.stringify({ navigated: path }) }] };
    }
  });
}

// Re-register on route changes
window.addEventListener("popstate", () => {
  registerNavTool(window.location.pathname);
});

// Initial registration
registerNavTool(window.location.pathname);
```

**Why capabilities, not tools?**

Tool names are implementation details. They change. "billing_form" might become "subscription_config" tomorrow. But "/billing - Manage subscription" stays true regardless.

The AI doesn't need to know tool names in advance. After navigation, it calls `list_webmcp_tools` to see what's available.

---

## Read-Only Tools

**Purpose:** Fetch data that AI needs to make decisions.

**Rules:**
1. Mark `readOnlyHint: true` and `idempotentHint: true`
2. No deps needed if fetching fresh each call
3. Can register at layout level for cross-page access
4. Return structured data, not just strings

**When to use:**
- Status checks (subscription status, feature flags)
- Data lookups (user profile, org details)
- Computed values (usage stats, remaining quota)

**When NOT to use:**
- If the data is already in the description (avoid redundant round trips)
- If calling an API is expensive (cache or include in description)

**Example (React):**
```tsx
useWebMCP({
  name: "billing_status",
  description: "Get current subscription status, plan details, and usage.",
  inputSchema: {},
  outputSchema: {
    plan: z.string(),
    status: z.enum(["active", "past_due", "cancelled"]),
    usage: z.number(),
    limit: z.number(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true },
  handler: async () => {
    const data = await fetchBillingStatus();
    return {
      plan: data.plan,
      status: data.status,
      usage: data.usage,
      limit: data.limit,
    };
  },
}, []);  // No deps - always fetches fresh
```

**Example (Vanilla JS):**
```js
navigator.modelContext.registerTool({
  name: "billing_status",
  description: "Get current subscription status, plan details, and usage.",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true, idempotentHint: true },
  execute: async () => {
    const response = await fetch("/api/billing/status");
    const data = await response.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          plan: data.plan,
          status: data.status,
          usage: data.usage,
          limit: data.limit,
        })
      }]
    };
  }
});
```

---

## Form Tools: Read/Fill

**Purpose:** Let AI read and modify form state in one unified tool.

**The pattern:**
```
Call with {} → returns current values
Call with {field: value} → merges with current, saves
```

**Rules:**
1. All input fields optional (allows partial updates)
2. Input takes precedence: `input.field ?? currentField`
3. Include current state in description
4. Re-register when state changes (updates description)
5. Mark `destructiveHint: true`

**The merge logic:**

```
Current: { theme: "light", notifications: true }
Input: { theme: "dark" }
Result: { theme: "dark", notifications: true }
```

Fields not in input keep their current values. Partial updates just work.

**Description template:**
```
Configure {thing}. Current: {summary of current state}

{Field documentation if needed}

Call with no values to read current state.
Call with values to update and save.
```

**Example (React):**
```tsx
function IDPConfigForm() {
  const [idpType, setIdpType] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const [domain, setDomain] = useState("");
  const saveMutation = useMutation({ mutationFn: saveIdpConfig });

  useWebMCP({
    name: "idp_config",
    description: `Configure identity provider for SSO.

Current: ${idpType ?? "not configured"}

Provider types:
- okta: Requires domain (e.g., "dev-123456.okta.com")
- auth0: Requires domain (e.g., "myapp.auth0.com")
- google: No domain needed
- custom_oidc: Requires issuer URL

Call with no values to read current state.
Call with values to update and save.`,
    inputSchema: {
      idp_type: z.enum(["okta", "auth0", "google", "custom_oidc"]).optional(),
      client_id: z.string().optional(),
      domain: z.string().optional(),
    },
    annotations: { destructiveHint: true },
    handler: async (input) => {
      const hasInput = Object.values(input).some(v => v !== undefined);

      if (!hasInput) {
        return {
          mode: "read",
          values: { idp_type: idpType, client_id: clientId, domain },
        };
      }

      // Input takes precedence, fall back to current state
      await saveMutation.mutateAsync({
        idp_type: input.idp_type ?? idpType,
        client_id: input.client_id ?? clientId,
        domain: input.domain ?? domain,
      });

      return { mode: "filled", values: input };
    },
  }, [idpType, clientId, domain, saveMutation]);

  return <form>...</form>;
}
```

**Example (Vanilla JS):**
```js
let config = { idp_type: null, client_id: "", domain: "" };
let registration = null;

function registerIdpConfigTool() {
  registration?.unregister();

  registration = navigator.modelContext.registerTool({
    name: "idp_config",
    description: `Configure IDP. Current: ${config.idp_type ?? "not configured"}

Call with no values to read. Call with values to save.`,
    inputSchema: {
      type: "object",
      properties: {
        idp_type: { type: "string", enum: ["okta", "auth0", "google"] },
        client_id: { type: "string" },
        domain: { type: "string" },
      }
    },
    annotations: { destructiveHint: true },
    execute: async (input) => {
      if (!Object.keys(input).length) {
        return { content: [{ type: "text", text: JSON.stringify(config) }] };
      }

      config = {
        idp_type: input.idp_type ?? config.idp_type,
        client_id: input.client_id ?? config.client_id,
        domain: input.domain ?? config.domain,
      };
      await saveToApi(config);
      registerIdpConfigTool();  // Re-register with updated description

      return { content: [{ type: "text", text: "Saved" }] };
    }
  });
}
```

---

## Form Tools: Fill/Submit

**Purpose:** Separate tools for staging vs committing, so the user sees changes before they're saved.

**The pattern:**
- **Fill tool** (idempotent): Updates form fields visually, no backend changes
- **Submit tool** (destructive): Saves current form state to backend

Like `git add` then `git commit`. The fill tool stages changes; the submit tool persists them.

**When to use instead of Read/Fill:**
- Complex forms where the user should verify changes before save
- Multi-field forms where the AI may iterate (fill, adjust, fill again)
- Forms with expensive or irreversible writes

**Example (React):**
```tsx
function IDPConfigPage() {
  const [formState, setFormState] = useState({
    idp_type: null as string | null,
    client_id: "",
    domain: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const saveMutation = useMutation({ mutationFn: saveIdpConfig });

  // Fill tool - updates UI only, no backend changes
  useWebMCP({
    name: "idp_form",
    description: `Fill IDP configuration form.

Current form state: ${JSON.stringify(formState)}
${isDirty ? "Has unsaved changes." : "No unsaved changes."}

Updates the form visually. Use idp_submit to save.`,
    inputSchema: {
      idp_type: z.enum(["okta", "auth0", "google"]).optional(),
      client_id: z.string().optional(),
      domain: z.string().optional(),
    },
    annotations: { idempotentHint: true },
    handler: async (input) => {
      const hasInput = Object.values(input).some(v => v !== undefined);
      if (!hasInput) {
        return { formState, isDirty };
      }

      setFormState(prev => ({ ...prev, ...input }));
      setIsDirty(true);
      return { filled: true, values: input };
    },
  }, [formState, isDirty]);

  // Submit tool - saves to backend
  useWebMCP({
    name: "idp_submit",
    description: `Save IDP configuration to backend.

${isDirty ? `Will save: ${JSON.stringify(formState)}` : "No unsaved changes to submit."}`,
    inputSchema: {},
    annotations: { destructiveHint: true },
    handler: async () => {
      if (!isDirty) {
        throw new Error("No unsaved changes to submit.");
      }
      await saveMutation.mutateAsync(formState);
      setIsDirty(false);
      return { saved: true, values: formState };
    },
  }, [formState, isDirty, saveMutation]);

  return <form>...</form>;
}
```

**Example (Vanilla JS):**
```js
let formState = { idp_type: null, client_id: "", domain: "" };
let isDirty = false;
let fillReg = null;
let submitReg = null;

function registerFormTools() {
  fillReg?.unregister();
  submitReg?.unregister();

  fillReg = navigator.modelContext.registerTool({
    name: "idp_form",
    description: `Fill IDP form. Current: ${JSON.stringify(formState)}
${isDirty ? "Has unsaved changes." : ""}
Updates form visually. Use idp_submit to save.`,
    inputSchema: {
      type: "object",
      properties: {
        idp_type: { type: "string", enum: ["okta", "auth0", "google"] },
        client_id: { type: "string" },
        domain: { type: "string" },
      }
    },
    annotations: { idempotentHint: true },
    execute: async (input) => {
      if (!Object.keys(input).length) {
        return { content: [{ type: "text", text: JSON.stringify({ formState, isDirty }) }] };
      }
      formState = { ...formState, ...input };
      isDirty = true;
      // Update DOM to reflect changes
      Object.entries(input).forEach(([key, val]) => {
        const el = document.querySelector(`[name="${key}"]`);
        if (el) el.value = val;
      });
      registerFormTools();
      return { content: [{ type: "text", text: JSON.stringify({ filled: true }) }] };
    }
  });

  submitReg = navigator.modelContext.registerTool({
    name: "idp_submit",
    description: `Save IDP config. ${isDirty ? "Has unsaved changes." : "Nothing to save."}`,
    inputSchema: { type: "object", properties: {} },
    annotations: { destructiveHint: true },
    execute: async () => {
      if (!isDirty) {
        return { content: [{ type: "text", text: "No changes to save" }], isError: true };
      }
      await fetch("/api/idp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      isDirty = false;
      registerFormTools();
      return { content: [{ type: "text", text: JSON.stringify({ saved: true }) }] };
    }
  });
}

registerFormTools();
```

---

## Action Tools

**Purpose:** One-shot actions with side effects (send email, deploy, etc.)

**Rules:**
1. Required fields (no `.optional()`) for critical inputs
2. Mark `destructiveHint: true`
3. Return confirmation with IDs or status
4. Use `onSuccess`/`onError` for user feedback

**When to use:**
- Discrete actions: send, deploy, invite, export
- Actions that don't fit read/fill (no "current state" to read)

**Watch out:**
- Don't create action tools for things that could be form fields
- If you're building "set_theme" as an action, it should probably be part of a settings form tool

**Example (React):**
```tsx
useWebMCP({
  name: "send_invite",
  description: "Send an invitation email to a new team member.",
  inputSchema: {
    email: z.string().email().describe("Email address to invite"),
    role: z.enum(["admin", "member", "viewer"]).describe("Role for the new member"),
  },
  annotations: { destructiveHint: true },
  handler: async ({ email, role }) => {
    const result = await sendInvite({ email, role });
    return { sent: true, inviteId: result.id };
  },
  onSuccess: () => toast.success("Invitation sent!"),
  onError: (error) => toast.error(`Failed: ${error.message}`),
}, []);
```

**Example (Vanilla JS):**
```js
navigator.modelContext.registerTool({
  name: "send_invite",
  description: "Send an invitation email to a new team member.",
  inputSchema: {
    type: "object",
    properties: {
      email: { type: "string", format: "email", description: "Email address to invite" },
      role: { type: "string", enum: ["admin", "member", "viewer"], description: "Role for the new member" }
    },
    required: ["email", "role"]
  },
  annotations: { destructiveHint: true },
  execute: async ({ email, role }) => {
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });
      const result = await response.json();
      return { content: [{ type: "text", text: JSON.stringify({ sent: true, inviteId: result.id }) }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Failed to send invite: ${error.message}` }],
        isError: true,
      };
    }
  }
});
```

---

## Dependencies and Re-registration

The handler function captures state at registration time. Without proper deps, you get stale values.

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
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**React:**
```tsx
// WRONG: Empty deps means handler sees initial values forever
const [count, setCount] = useState(0);
useWebMCP({
  handler: async () => ({ count }),  // Always returns 0!
}, []);  // Never re-registers

// CORRECT: Include values used in handler
useWebMCP({
  handler: async () => ({ count }),  // Returns current count
}, [count]);  // Re-registers when count changes
```

**What triggers re-registration:**
- Changes to any value in the `deps` array
- Changes to `name` or `description`
- Changes to `inputSchema`/`outputSchema`/`annotations` (by reference)

**What does NOT trigger re-registration:**
- Changes to `handler` function (stored in ref internally)
- Changes to `onSuccess`/`onError` callbacks

**Vanilla JS:**
```js
// Manually unregister and re-register when state changes
let registration = null;

function registerTool() {
  registration?.unregister();
  registration = navigator.modelContext.registerTool({
    description: `Current count: ${count}`,
    execute: async () => ({ count }),
    // ...
  });
}

// Call registerTool() whenever count changes
```

---

## Error Handling

**React vs Vanilla JS:**

| Environment | Error Method | Result |
|-------------|--------------|--------|
| **React** (`useWebMCP`) | `throw new Error("...")` | Auto-converted to `{ isError: true, content: [...] }` |
| **Vanilla JS** | Return `{ content: [...], isError: true }` | Must construct MCP error format manually |

**React example:**
```tsx
handler: async (input) => {
  if (!input.email) {
    throw new Error("Email is required");  // Auto-converted to MCP error
  }
  // ...
}
```

**Vanilla JS example:**
```js
execute: async (input) => {
  if (!input.email) {
    return {
      content: [{ type: "text", text: "Email is required" }],
      isError: true,
    };
  }
  // ...
}
```

**Structured errors for validation:**

Give AI enough info to fix the input:

```js
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      error: "Invalid email format",
      field: "email",
      suggestion: "Use format: user@domain.com"
    })
  }],
  isError: true,
};
```

---

## Anti-Patterns

### Tool Explosion

```
BAD:  user_get_name, user_get_email, user_get_phone, user_set_name, ...
GOOD: user_profile (read/fill pattern)
```

### Redundant Read Tools

```
BAD:  settings_read + settings_update (separate tools)
GOOD: settings (read/fill in one tool)
```

### Stateless Descriptions

```
BAD:  "Configure user settings"
GOOD: "Configure user settings. Current: theme=dark, notifications=on"
```

### Navigation Listing Tools

```
BAD:  "/billing - Tools: billing_form, payment_methods, invoice_list"
GOOD: "/billing - Manage subscription, update payment, view invoices"
```

### Forgetting Re-registration

```
BAD:  Empty deps array with state in handler
GOOD: Include all closure values in deps
```

### UI State in Tool Design

```
BAD:  skill_edit_start, skill_edit_update, skill_edit_save (5 tools tracking edit mode)
GOOD: skill_content (1 read/fill tool)
```

AI doesn't care about "edit mode." That's a UI concern. The AI wants to read content and write content. Period.
