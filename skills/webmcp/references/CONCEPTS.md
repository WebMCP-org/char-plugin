# WebMCP Concepts

Understanding WHY WebMCP tools work the way they do. For the rules themselves, see [SKILL.md](../SKILL.md). For code examples, see [PATTERNS.md](PATTERNS.md).

## The Browser as Server

Traditional MCP: A separate process (Node.js, Python) exposes tools via stdio/HTTP.

WebMCP: Your webpage IS the server. Tools live in the browser tab.

**Implications:**
- Tools have DOM access, browser APIs, application state
- Tools can trigger UI updates, navigation, form fills
- AI operates within the user's security context
- Tools appear/disappear as the user navigates (component lifecycle)

## Why Re-registration Matters

The handler function captures state via closures, but the **description** is a string frozen at registration time. When state changes, the handler may still see current values (depending on your framework), but the description — which the AI reads to decide what to do — is stale.

To update the description, you must re-register. That's why:
- React: the deps array triggers re-registration when values change
- Vanilla JS: you manually call unregister/register

Re-register on **meaningful** changes (selected provider, active plan), not on every keystroke. The cost of re-registration is non-zero.

## Why Read/Fill

**Problem 1: Tool Proliferation.** Without read/fill, you get `settings_read`, `settings_fill`, `settings_submit` — three tools per form. AI confusion: When read vs fill? Does fill auto-submit? Partial updates how?

**Problem 2: Extra Round Trips.** Separate read and write tools mean the AI must call read, then write, then read again to verify. With read/fill, the write response confirms the result.

**Problem 3: Partial Updates.** With separate tools, updating one field requires knowing all others. With read/fill, `{ theme: "dark" }` merges naturally — unspecified fields keep their current values.

## Why Input Takes Precedence

React state updates are async. In a handler, `setState(input.value)` schedules an update for the next render — but the save call happens in the current render, reading the old value.

The pattern `input.field ?? closureValue` avoids this: if the AI provided a value, use it directly. If not, fall back to the closure-captured current state.

## Why Descriptions Include State

Without state in the description, the AI must call read mode just to know current values — an extra round trip before every action. With `"Current: theme=dark, notifications=on"` in the description, the AI already knows and can decide what to change immediately.

This is why re-registration matters: the description must stay fresh for this to work.

## Why Annotations Matter

Hints tell the AI how to treat tools:

- **readOnlyHint: true** — "Safe to call freely." No user confirmation needed. Use for queries, status checks.
- **idempotentHint: true** — "Same input, same output." Safe to retry. Use for lookups, calculations.
- **destructiveHint: true** — "Modifies state." Consider user confirmation. Use for saves, deletes, navigation.

## Navigation and Tool Lifecycle

SPA navigation = component unmount/mount:

```
/settings mounted → settings_form registered
Navigate to /billing
/settings unmounted → settings_form unregistered
/billing mounted → billing_form registered
```

That's why:
1. The navigation tool lives at layout level (survives transitions)
2. Navigation is destructive (causes tool unmounting)
3. Page tools are page-scoped (tied to component lifecycle)

## The Trust Model

WebMCP tools run in the browser, not a sandboxed server. They have full access to the DOM, browser APIs (localStorage, cookies), and application context (auth tokens, user data).

This is powerful but requires trust. The AI operates AS the user, with the same permissions.

## Mental Model Summary

1. **Your app is the server** — Browser exposes tools via `navigator.modelContext`
2. **Lifecycle = component lifecycle** — Tools mount/unmount with components
3. **Descriptions are frozen strings** — Re-register to update them
4. **Read/fill unifies operations** — One tool, two modes, partial updates
5. **Input wins** — `input.field ?? closureValue`
6. **Descriptions are context** — Include current state, keep it fresh
7. **Annotations guide AI** — Hints about safety and side effects
8. **Errors: throw in React, return in vanilla** — See [PATTERNS.md](PATTERNS.md) for details
