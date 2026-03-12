# Testing Guide (Publishable Key + Shell)

How to validate Char integrations with Chrome DevTools MCP and manual fallback.

## Baseline Test Fixture

Use a page with:
- `<char-agent-shell>` or `<char-agent>`
- `publishableKey` configured
- at least one WebMCP tool registered in host app

## Phase 1: Embed Runtime Validation

Verify:
1. Element is present (`char-agent-shell` preferred)
2. No console errors on load
3. Shell behavior works:
   - closed: pill visible
   - desktop open: inline right panel
   - narrow viewport open: fullscreen

## Phase 2: Auth Validation

### Key-only mode

```ts
shell.setAuth({ publishableKey: "pk_live_..." });
```

Verify agent can chat.

### User-attributed mode (optional)

```ts
shell.setAuth({ publishableKey: "pk_live_...", idToken });
```

Verify attributed identity and session behavior.

## Phase 3: WebMCP Tool Validation

Use Chrome DevTools MCP:

```text
list_webmcp_tools summary=true
call_webmcp_tool name="your_tool" arguments={}
call_webmcp_tool name="your_tool" arguments={"field":"value"}
```

Verify:
- tool is discoverable
- read path works
- mutation path works
- result payload is understandable

## Automated Browser Validation Flow

Suggested command sequence:

```text
new_page url="http://localhost:3000"
take_snapshot
list_console_messages
list_webmcp_tools summary=true
call_webmcp_tool name="your_tool" arguments={}
take_screenshot
resize_page width=375 height=812
take_screenshot
```

## Manual Fallback (No CDP)

1. Open the page in Chrome/Edge
2. Confirm no console errors
3. Open Char and send a message
4. Ask the agent to run one WebMCP-backed action
5. Confirm host UI changed as expected

## Common Failures

| Error | Cause | Fix |
|------|-------|-----|
| `MISSING_PUBLISHABLE_KEY` | Key not supplied | Set `publishable-key` or call `setAuth({ publishableKey })` |
| `INVALID_KEY` | Revoked/invalid key | Regenerate key in dashboard |
| `ORIGIN_NOT_ALLOWED` | Origin not allowlisted | Add current origin to key/domain allowlist |
| Tool not listed | Registration never ran | Ensure `@mcp-b/global` is imported and component mounted |
| Tool call fails | Schema mismatch | Re-check input shape and descriptions |

## Quality Checklist

- [ ] Shell UX (pill/panel/fullscreen) behaves correctly
- [ ] Publishable key path works
- [ ] Optional `idToken` path works
- [ ] At least one WebMCP tool is callable
- [ ] No critical console/network errors
- [ ] Screenshots captured for desktop + mobile
