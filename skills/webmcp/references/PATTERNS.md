# WebMCP Tool Patterns

Detailed guidance for each tool type. Examples show the pattern shape; consult the WebMCP docs MCP server for up-to-date syntax.

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
// In your root layout component
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
- /integration - Widget configuration and SSO setup

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
      // Use your router's navigation method
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

Also: the AI doesn't need to know tool names in advance. After navigation, it calls `list_webmcp_tools` to see what's available.

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
- If the data is already in the description (use read/fill instead)
- If calling an API is expensive (cache or include in description)

**Layout vs Page:**

Layout-level read-only tools are powerful. "What's my subscription status?" works from any page. But don't overdo it - too many global tools clutters the tool list.

**Example (React):**
```tsx
// Can register at layout level for cross-page access
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
// Register once - no re-registration needed for read-only tools
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

## Form Tools (Read/Fill)

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

**Why read/fill instead of separate tools?**

Three tools per form (read, fill, submit) creates confusion:
- When do I read vs fill?
- Does fill auto-submit?
- How do I do partial updates?

One tool with modes is clearer. The AI already knows this pattern from Claude Code's Edit tool.

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

      // Show success toast (use your preferred notification library)
      showToast("Invitation sent!");

      return { content: [{ type: "text", text: JSON.stringify({ sent: true, inviteId: result.id }) }] };
    } catch (error) {
      showToast(`Failed: ${error.message}`, "error");
      // Return MCP error format (don't throw in vanilla JS)
      return {
        content: [{ type: "text", text: `Failed to send invite: ${error.message}` }],
        isError: true,
      };
    }
  }
});
```

---

## Confirmation Pattern

**Purpose:** Protect destructive actions that can't be undone.

**When to use:**
- Deletes
- Irreversible state changes
- Actions affecting other users

**Pattern:** Two separate tools

1. **Preview tool** (read-only)
   - Shows what would happen
   - Returns warning and confirmation instructions

2. **Confirm tool** (destructive)
   - Requires typing back a confirmation value
   - Actually performs the action

**Why not read/fill?**

Read/fill implies "fill and save." Delete doesn't fit - there's nothing to "fill." The preview/confirm split makes the danger explicit.

**Example (React):**
```tsx
// Preview tool - safe to call
useWebMCP({
  name: "delete_org_preview",
  description: "Preview what would be deleted. Does NOT delete anything.",
  inputSchema: {
    orgId: z.string().uuid(),
  },
  annotations: { readOnlyHint: true },
  handler: async ({ orgId }) => {
    const org = await fetchOrg(orgId);
    return {
      wouldDelete: {
        name: org.name,
        memberCount: org.members.length,
        projectCount: org.projects.length,
      },
      warning: "This action is IRREVERSIBLE. Use delete_org_confirm to proceed.",
      confirmationRequired: org.name,  // Tell AI what to type
    };
  },
}, []);

// Confirm tool - actually deletes
useWebMCP({
  name: "delete_org_confirm",
  description: "Actually delete an organization. IRREVERSIBLE.",
  inputSchema: {
    orgId: z.string().uuid(),
    confirmName: z.string().describe("Type the org name to confirm"),
  },
  annotations: { destructiveHint: true },
  handler: async ({ orgId, confirmName }) => {
    const org = await fetchOrg(orgId);
    if (org.name !== confirmName) {
      throw new Error(`Confirmation failed. Expected "${org.name}", got "${confirmName}"`);
    }
    await deleteOrg(orgId);
    return { deleted: true, orgId };
  },
}, []);
```

**Example (Vanilla JS):**
```js
// Preview tool - safe to call
navigator.modelContext.registerTool({
  name: "delete_org_preview",
  description: "Preview what would be deleted. Does NOT delete anything.",
  inputSchema: {
    type: "object",
    properties: {
      orgId: { type: "string", format: "uuid" }
    },
    required: ["orgId"]
  },
  annotations: { readOnlyHint: true },
  execute: async ({ orgId }) => {
    const response = await fetch(`/api/orgs/${orgId}`);
    const org = await response.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          wouldDelete: {
            name: org.name,
            memberCount: org.members.length,
            projectCount: org.projects.length,
          },
          warning: "This action is IRREVERSIBLE. Use delete_org_confirm to proceed.",
          confirmationRequired: org.name,
        })
      }]
    };
  }
});

// Confirm tool - actually deletes
navigator.modelContext.registerTool({
  name: "delete_org_confirm",
  description: "Actually delete an organization. IRREVERSIBLE.",
  inputSchema: {
    type: "object",
    properties: {
      orgId: { type: "string", format: "uuid" },
      confirmName: { type: "string", description: "Type the org name to confirm" }
    },
    required: ["orgId", "confirmName"]
  },
  annotations: { destructiveHint: true },
  execute: async ({ orgId, confirmName }) => {
    // Fetch org to verify name
    const response = await fetch(`/api/orgs/${orgId}`);
    const org = await response.json();

    if (org.name !== confirmName) {
      // Return MCP error format (don't throw in vanilla JS)
      return {
        content: [{ type: "text", text: `Confirmation failed. Expected "${org.name}", got "${confirmName}"` }],
        isError: true,
      };
    }

    // Actually delete
    await fetch(`/api/orgs/${orgId}`, { method: "DELETE" });
    return { content: [{ type: "text", text: JSON.stringify({ deleted: true, orgId }) }] };
  }
});
```

---

## Wizard/Multi-Step Pattern

**Purpose:** Complex flows where steps depend on previous answers.

**Pattern:** One tool per step, with guards

```
Step 1: Basic info
Step 2: Details (requires step 1 complete)
Step 3: Review (requires steps 1-2 complete)
Step 4: Submit (requires all steps complete)
```

**Rules:**
1. Each step checks prerequisites before allowing fill
2. Description shows which steps are complete
3. Response indicates next step
4. Consider a separate "wizard_status" read-only tool

**When to use:**
- Onboarding flows
- Complex configuration with dependencies
- Multi-page forms

**When NOT to use:**
- Simple forms - just use one read/fill tool
- Forms where fields are independent - read/fill handles partial updates

**Example (Vanilla JS):**
```js
// State tracks wizard progress
let wizardState = {
  step1: null,  // { name, email }
  step2: null,  // { plan, billing }
  step3: null,  // { confirmed: true }
};
let wizardRegistrations = [];

function registerWizardTools() {
  // Unregister all previous
  wizardRegistrations.forEach(r => r.unregister());
  wizardRegistrations = [];

  const step1Complete = wizardState.step1 !== null;
  const step2Complete = wizardState.step2 !== null;

  // Step 1: Always available
  wizardRegistrations.push(navigator.modelContext.registerTool({
    name: "onboarding_step1",
    description: `Step 1: Basic info. ${step1Complete ? "✓ Complete" : "Not started"}

Call with {} to read, call with values to save.`,
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" }
      }
    },
    annotations: { destructiveHint: true },
    execute: async (input) => {
      if (!Object.keys(input).length) {
        return { content: [{ type: "text", text: JSON.stringify(wizardState.step1 ?? {}) }] };
      }
      wizardState.step1 = { ...wizardState.step1, ...input };
      registerWizardTools();  // Re-register to update descriptions
      return { content: [{ type: "text", text: JSON.stringify({ saved: true, nextStep: 2 }) }] };
    }
  }));

  // Step 2: Only if step 1 complete
  wizardRegistrations.push(navigator.modelContext.registerTool({
    name: "onboarding_step2",
    description: `Step 2: Plan selection. ${!step1Complete ? "⚠️ Complete step 1 first" : step2Complete ? "✓ Complete" : "Ready"}`,
    inputSchema: {
      type: "object",
      properties: {
        plan: { type: "string", enum: ["free", "pro", "enterprise"] },
        billing: { type: "string", enum: ["monthly", "annual"] }
      }
    },
    annotations: { destructiveHint: true },
    execute: async (input) => {
      if (!step1Complete) {
        return {
          content: [{ type: "text", text: "Complete step 1 first" }],
          isError: true,
        };
      }
      if (!Object.keys(input).length) {
        return { content: [{ type: "text", text: JSON.stringify(wizardState.step2 ?? {}) }] };
      }
      wizardState.step2 = { ...wizardState.step2, ...input };
      registerWizardTools();
      return { content: [{ type: "text", text: JSON.stringify({ saved: true, nextStep: 3 }) }] };
    }
  }));

  // Step 3: Submit (only if steps 1-2 complete)
  wizardRegistrations.push(navigator.modelContext.registerTool({
    name: "onboarding_submit",
    description: `Step 3: Submit. ${!step1Complete || !step2Complete ? "⚠️ Complete previous steps first" : "Ready to submit"}`,
    inputSchema: { type: "object", properties: {} },
    annotations: { destructiveHint: true },
    execute: async () => {
      if (!step1Complete || !step2Complete) {
        return {
          content: [{ type: "text", text: "Complete all steps first" }],
          isError: true,
        };
      }
      await submitOnboarding(wizardState);
      return { content: [{ type: "text", text: JSON.stringify({ complete: true }) }] };
    }
  }));
}

registerWizardTools();
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

**Structured vs simple errors:**

For validation errors, give AI enough info to fix the input:

```js
// Simple - just the message
return {
  content: [{ type: "text", text: "Invalid email format" }],
  isError: true,
};

// Structured - more context for AI
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
❌ user_get_name, user_get_email, user_get_phone, user_set_name, ...
✅ user_profile (read/fill pattern)
```

### Redundant Read Tools

```
❌ settings_read + settings_update (separate tools)
✅ settings (read/fill in one tool)
```

### Stateless Descriptions

```
❌ "Configure user settings"
✅ "Configure user settings. Current: theme=dark, notifications=on"
```

### Navigation Listing Tools

```
❌ "/billing - Tools: billing_form, payment_methods, invoice_list"
✅ "/billing - Manage subscription, update payment, view invoices"
```

### Forgetting Re-registration

```
❌ Empty deps array with state in handler
✅ Include all closure values in deps
```

### UI State in Tool Design

```
❌ skill_edit_start, skill_edit_update, skill_edit_save (5 tools tracking edit mode)
✅ skill_content (1 read/fill tool)
```

AI doesn't care about "edit mode." That's a UI concern. The AI wants to read content and write content. Period.

---

## Migrating to Read/Fill

When refactoring existing tools to read/fill:

**Before (5 tools):**
```
thing_view         - read current state
thing_edit_start   - enter edit mode
thing_edit_update  - update content in editor
thing_edit_cancel  - discard changes
thing_edit_save    - persist changes
```

**After (1 tool):**
```
thing_content      - read/fill pattern
  {} → read current state
  { content: "..." } → save directly
```

**Migration steps:**

1. **Add a direct save function** that takes content and returns a Promise:
   ```tsx
   // In your route/page component
   const saveContent = useCallback(async (newContent: string) => {
     await mutation.mutateAsync({ content: newContent });
   }, [mutation]);
   ```

2. **Simplify the hook state interface:**
   ```tsx
   // Before
   interface State {
     isEditing: boolean;
     editContent: string;
     startEdit: () => void;
     cancelEdit: () => void;
     setEditContent: (content: string) => void;
     saveChanges: () => void;
   }

   // After
   interface State {
     content: string;
     saveContent: (content: string) => Promise<void>;
     isSaving: boolean;
   }
   ```

3. **Replace all tools with one read/fill tool:**
   ```tsx
   useWebMCP({
     name: "thing_content",
     description: `Read or update content. Current: ${summary}

   Call with no values to read.
   Call with content to save.`,
     inputSchema: { content: z.string().optional() },
     annotations: { destructiveHint: true },
     handler: async (input) => {
       if (input.content === undefined) {
         return { mode: "read", content: currentContent };
       }
       await saveContent(input.content);
       return { mode: "filled", content: input.content };
     },
   }, [summary, currentContent, saveContent]);
   ```

**Key insight:** The UI can still have edit mode, cancel buttons, and draft states. But the WebMCP tool bypasses all of that - it's a direct read/write interface. UI complexity stays in the UI; the tool stays simple.
