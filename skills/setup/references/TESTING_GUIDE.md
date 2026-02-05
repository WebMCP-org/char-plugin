# Testing Guide

How to test Char embedded agent integrations using Chrome DevTools MCP and manual verification.

---

## Phase 1: Stateless Testing (Development)

**Goal**: Verify basic functionality without backend

**Setup**:
```html
<char-agent
  dev-mode='{"anthropicApiKey": "sk-ant-api03-..."}'>
</char-agent>
```

**Tests**:
1. Widget appears
2. Chat opens on click
3. Agent responds to messages
4. WebMCP tools execute (using Chrome DevTools MCP to verify)
5. No console errors

**Advantages**:
- Fast iteration
- No backend setup required
- Easy debugging

**Disadvantages**:
- No conversation persistence
- No user identification
- Not suitable for production

---

## Phase 2: Stateful Testing (Production Preparation)

**Goal**: Verify backend integration and persistence

**Setup**:
```html
<char-agent
  auth-token="YOUR_AUTH_TOKEN">
</char-agent>
```

**Tests**:
1. Conversation persists across page reloads
2. User identification works
3. Multiple users have separate conversations
4. Backend API endpoints respond correctly
5. Database stores messages

**Advantages**:
- Production-like environment
- Conversation history
- User tracking

**Disadvantages**:
- Requires auth-token issuance
- Requires allowed origins setup

---

## Automated Testing with Chrome DevTools MCP

The Chrome DevTools MCP server enables **fully automated verification**:

```typescript
// Pseudo-code for automated test flow

// 1. Navigate to page
await mcp__chrome-devtools__navigate_page({
  url: 'http://localhost:3000'
})

// 2. Take snapshot to verify page loaded
const snapshot = await mcp__chrome-devtools__take_snapshot()
// Parse snapshot to find widget element

// 3. Click widget to open chat
await mcp__chrome-devtools__click({
  uid: 'char-pill'
})

// 4. Wait for chat to open
await mcp__chrome-devtools__wait_for({
  text: 'How can I help you today?'
})

// 5. Fill chat input and send message
await mcp__chrome-devtools__fill({
  uid: 'chat-input',
  value: 'Fill out the contact form with test data'
})
await mcp__chrome-devtools__press_key({
  key: 'Enter'
})

// 6. Wait for agent to execute tool
await mcp__chrome-devtools__wait_for({
  text: 'I\'ve filled out the contact form'
})

// 7. Verify form was filled
const formSnapshot = await mcp__chrome-devtools__take_snapshot()
// Parse to verify form fields have values

// 8. Take screenshot for visual verification
await mcp__chrome-devtools__take_screenshot({
  filePath: './test-results/form-filled.png'
})

// Success!
```

---

## Manual Testing (Fallback)

If Chrome DevTools MCP is not available:

1. **Open browser** to target URL
2. **Check console** for `Char embedded agent initialized!`
3. **Click widget** to open chat
4. **Test commands**:
   - "What is on this page?" (snapshot tool)
   - "Fill out the form with test data" (fill tool)
   - "Click the submit button" (click tool)
   - "Take a screenshot" (screenshot tool)
5. **Verify results** manually

---

## Verifying Tool Registration

Use `diff_webmcp_tools` to check what tools are registered:

```bash
# Check current tools
const tools = await mcp__chrome-devtools__diff_webmcp_tools()

# Tools are named: webmcp_{host}_{page}_toolname
# Example: webmcp_localhost_3000_page0_fill_login_form
```

### Progressive Disclosure Test

1. Navigate to page A
2. Check tools - should see page A tools
3. Navigate to page B
4. Check tools again - page A tools gone, page B tools appear

---

## Common Test Scenarios

### Test Login Flow

```typescript
// 1. Navigate to login
await mcp__chrome-devtools__navigate_page({ url: 'http://localhost:3000/signin' })

// 2. Verify login tools exist
const tools = await mcp__chrome-devtools__diff_webmcp_tools()
// Should include: fill_login_form, submit_login

// 3. Fill the form
await mcp__chrome-devtools__fill({
  uid: 'username-input',
  value: 'testuser'
})
await mcp__chrome-devtools__fill({
  uid: 'password-input',
  value: 'password123'
})

// 4. Submit
await mcp__chrome-devtools__click({
  uid: 'submit-button'
})

// 5. Verify redirect to dashboard
await mcp__chrome-devtools__wait_for({
  text: 'Welcome, testuser'
})
```

### Test Form Filling via Agent

```typescript
// 1. Open the chat widget
await mcp__chrome-devtools__click({ uid: 'chat-pill' })

// 2. Ask agent to fill form
await mcp__chrome-devtools__fill({
  uid: 'chat-input',
  value: 'Fill the contact form with name "John Doe", email "john@example.com", and message "Test message"'
})
await mcp__chrome-devtools__press_key({ key: 'Enter' })

// 3. Wait for agent to complete
await mcp__chrome-devtools__wait_for({
  text: 'filled',
  timeout: 10000
})

// 4. Verify form fields
const snapshot = await mcp__chrome-devtools__take_snapshot()
// Check snapshot contains "John Doe" and "john@example.com"
```

---

## Console Verification

Check for these console messages:

| Message | Meaning |
|---------|---------|
| `Char embedded agent initialized!` | Widget loaded successfully |
| `WebMCP tools registered: N` | N tools available to agent |
| `Connected to host` | Backend connection established (stateful mode) |

Check for errors:
```typescript
const messages = await mcp__chrome-devtools__list_console_messages({
  types: ['error']
})
// Should be empty or contain only non-critical errors
```

---

## Screenshot Verification

Capture screenshots at key milestones:

```typescript
// Widget collapsed
await mcp__chrome-devtools__take_screenshot({
  filePath: './screenshots/widget-collapsed.png'
})

// Widget expanded
await mcp__chrome-devtools__click({ uid: 'chat-pill' })
await mcp__chrome-devtools__take_screenshot({
  filePath: './screenshots/widget-expanded.png'
})

// Mobile viewport
await mcp__chrome-devtools__resize_page({ width: 375, height: 667 })
await mcp__chrome-devtools__take_screenshot({
  filePath: './screenshots/mobile.png'
})
```

---

## Troubleshooting Test Failures

| Issue | Cause | Solution |
|-------|-------|----------|
| Widget not found | Widget didn't load | Check console for errors, verify script loaded |
| Tools not registered | `navigator.modelContext.registerTool` not called | Verify the registration code runs on page load |
| Agent not responding | API key invalid | Check Anthropic API key is correct |
| Form not filled | Wrong element UID | Take snapshot, find correct UID |
| Timeout waiting for text | Agent slow or failed | Increase timeout, check agent logs |
