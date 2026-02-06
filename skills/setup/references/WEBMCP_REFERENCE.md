# CDP MCP w/ WebMCP Tools Reference

Complete reference for all WebMCP browser automation tools available to your embedded agent.

## Page Navigation

### `navigate_page`

Navigate to a URL, go back/forward, or reload the current page.

**Parameters:**
```typescript
{
  type: "url" | "back" | "forward" | "reload",
  url?: string,              // Required for type="url"
  ignoreCache?: boolean,     // For type="reload"
  timeout?: number           // Max wait time in ms
}
```

**Examples:**
```javascript
// Navigate to URL
{ type: "url", url: "https://example.com" }

// Go back
{ type: "back" }

// Reload without cache
{ type: "reload", ignoreCache: true }
```

---

## Element Interaction

### `click`

Click an element on the page.

**Parameters:**
```typescript
{
  uid: string,        // Element UID from snapshot
  dblClick?: boolean  // Double-click if true
}
```

**Example:**
```javascript
{ uid: "button-submit", dblClick: false }
```

### `fill`

Type text into an input field or select an option from a dropdown.

**Parameters:**
```typescript
{
  uid: string,   // Element UID from snapshot
  value: string  // Text to type or option to select
}
```

**Example:**
```javascript
{ uid: "input-email", value: "user@example.com" }
```

### `hover`

Hover over an element (useful for dropdowns, tooltips).

**Parameters:**
```typescript
{
  uid: string  // Element UID from snapshot
}
```

### `press_key`

Press a key or key combination.

**Parameters:**
```typescript
{
  key: string  // "Enter", "Control+A", "Shift+Tab", etc.
}
```

**Examples:**
```javascript
{ key: "Enter" }
{ key: "Control+A" }
{ key: "Control+Shift+R" }
```

---

## Form Automation

### `fill_form`

Fill multiple form fields at once.

**Parameters:**
```typescript
{
  elements: Array<{
    uid: string,
    value: string
  }>
}
```

**Example:**
```javascript
{
  elements: [
    { uid: "input-name", value: "John Doe" },
    { uid: "input-email", value: "john@example.com" },
    { uid: "select-topic", value: "support" }
  ]
}
```

### `upload_file`

Upload a file through a file input element.

**Parameters:**
```typescript
{
  uid: string,      // File input element UID
  filePath: string  // Local path to file
}
```

---

## Page Inspection

### `take_snapshot`

Capture text content of the page based on the accessibility tree.

**Parameters:**
```typescript
{
  filePath?: string,   // Save to file instead of returning
  verbose?: boolean    // Include all a11y tree info
}
```

**Returns:**
- List of elements with UIDs
- Element types, labels, values
- Page structure

**Example output:**
```
[1] heading "Contact Us"
[2] textbox "Name" value=""
[3] textbox "Email" value=""
[4] button "Submit"
```

### `take_screenshot`

Capture visual screenshot of page or specific element.

**Parameters:**
```typescript
{
  uid?: string,        // Element to screenshot (or full page if omitted)
  fullPage?: boolean,  // Capture full scrollable page
  filePath?: string,   // Save to file instead of returning
  format?: "png" | "jpeg" | "webp",
  quality?: number     // 0-100 for JPEG/WebP
}
```

---

## JavaScript Execution

### `evaluate_script`

Run JavaScript code in the page context.

**Parameters:**
```typescript
{
  function: string,    // JavaScript function as string
  args?: Array<{       // Optional arguments
    uid: string
  }>
}
```

**Examples:**
```javascript
// Get page title
{
  function: "() => document.title"
}

// Get element text
{
  function: "(el) => el.innerText",
  args: [{ uid: "heading-1" }]
}

// Complex operation
{
  function: `async () => {
    const response = await fetch('/api/data')
    return await response.json()
  }`
}
```

---

## Waiting & Timing

### `wait_for`

Wait for specific text to appear on the page.

**Parameters:**
```typescript
{
  text: string,
  timeout?: number  // Max wait time in ms
}
```

**Example:**
```javascript
{ text: "Loading complete", timeout: 5000 }
```

---

## Browser Management

### `resize_page`

Resize the browser window.

**Parameters:**
```typescript
{
  width: number,   // Page width in pixels
  height: number   // Page height in pixels
}
```

**Example:**
```javascript
// Mobile viewport
{ width: 375, height: 667 }

// Desktop viewport
{ width: 1920, height: 1080 }
```

### `new_page`

Open a new browser tab.

**Parameters:**
```typescript
{
  url: string,
  timeout?: number
}
```

### `close_page`

Close a browser tab by index.

**Parameters:**
```typescript
{
  pageIdx: number
}
```

### `select_page`

Switch to a different browser tab.

**Parameters:**
```typescript
{
  pageIdx: number
}
```

### `list_pages`

Get list of all open browser tabs.

**Returns:**
- Array of pages with indices, titles, URLs

---

## Dialog Handling

### `handle_dialog`

Respond to JavaScript alerts, confirms, prompts.

**Parameters:**
```typescript
{
  action: "accept" | "dismiss",
  promptText?: string  // For prompt() dialogs
}
```

**Example:**
```javascript
// Accept confirm dialog
{ action: "accept" }

// Dismiss alert
{ action: "dismiss" }

// Enter text in prompt
{ action: "accept", promptText: "My input" }
```

---

## Network & Performance

### `list_network_requests`

Get network requests made by the page.

**Parameters:**
```typescript
{
  resourceTypes?: Array<"document" | "stylesheet" | "script" | "xhr" | "fetch" | ...>,
  pageIdx?: number,
  pageSize?: number,
  includePreservedRequests?: boolean
}
```

### `get_network_request`

Get detailed info about a specific network request.

**Parameters:**
```typescript
{
  reqid?: number  // If omitted, returns currently selected request
}
```

### `list_console_messages`

Get console logs from the page.

**Parameters:**
```typescript
{
  types?: Array<"log" | "debug" | "info" | "error" | "warn" | ...>,
  pageIdx?: number,
  pageSize?: number,
  includePreservedMessages?: boolean
}
```

### `get_console_message`

Get detailed info about a specific console message.

**Parameters:**
```typescript
{
  msgid: number
}
```

---

## Advanced Features

### `drag`

Drag an element onto another element.

**Parameters:**
```typescript
{
  from_uid: string,
  to_uid: string
}
```

### `emulate`

Emulate device features.

**Parameters:**
```typescript
{
  networkConditions?: "No emulation" | "Offline" | "Slow 3G" | "Fast 3G" | ...,
  cpuThrottlingRate?: number,  // 1 = no throttling, higher = slower
  geolocation?: {
    latitude: number,   // -90 to 90
    longitude: number   // -180 to 180
  } | null
}
```

**Example:**
```javascript
// Slow 3G with CPU throttling
{
  networkConditions: "Slow 3G",
  cpuThrottlingRate: 4
}

// Set location
{
  geolocation: {
    latitude: 37.7749,
    longitude: -122.4194
  }
}
```

---

## Best Practices

### 1. Always Take Snapshots First

Before interacting with elements, take a snapshot to get element UIDs:

```javascript
// 1. Take snapshot
take_snapshot()

// 2. Find element UID in results
// e.g., [42] button "Submit Form"

// 3. Click using UID
click({ uid: "42" })
```

### 2. Wait for Dynamic Content

For SPAs and dynamic pages, wait for content to load:

```javascript
// Wait for specific text
wait_for({ text: "Dashboard loaded" })

// Or check network idle in evaluate_script
evaluate_script({
  function: `() => {
    return document.readyState === 'complete'
  }`
})
```

### 3. Use fill_form for Multiple Inputs

Instead of individual `fill()` calls, batch them:

```javascript
// ❌ Slow
fill({ uid: "name", value: "John" })
fill({ uid: "email", value: "john@example.com" })
fill({ uid: "phone", value: "555-1234" })

// ✅ Fast
fill_form({
  elements: [
    { uid: "name", value: "John" },
    { uid: "email", value: "john@example.com" },
    { uid: "phone", value: "555-1234" }
  ]
})
```

### 4. Handle Errors Gracefully

Always check if elements exist before interacting:

```javascript
// Take snapshot first
const snapshot = take_snapshot()

// Check if element exists
if (snapshot.includes('button "Submit"')) {
  click({ uid: "submit-button" })
} else {
  console.log("Submit button not found")
}
```

---

## Tool Availability

All these tools are automatically available when you:
1. Use the embedded agent widget
2. Have the Chrome DevTools MCP server running
3. Are on a page with WebMCP integration

No additional configuration needed!
