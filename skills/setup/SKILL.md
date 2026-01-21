---
name: setup
description: Set up Char embedded AI agent in your web application. Guides you through embedding, styling, and creating your first WebMCP tool.
---

# Char Setup

You are setting up Char, an embedded AI agent that can interact with web applications through WebMCP tools. This skill walks the user through three steps:

1. **Embed the agent** - Get it running locally with an API key
2. **Style it** - Match their brand using CSS variables
3. **Create a WebMCP tool** - Let the agent interact with their UI

## Documentation Sources

You have access to documentation MCP servers. Use them throughout this setup:

| Server | Use For | Example |
|--------|---------|---------|
| `mcp__char-docs__SearchChar` | Embedding, attributes, styling, SSO | "CSS variables", "auth-token attribute" |
| `mcp__webmcp-Docs__SearchWebMcpDocumentation` | Tool registration, WebMCP API | "registerTool", "inputSchema" |

When a user asks for details beyond what's in this skill, search the relevant docs server.

---

## Step 1: Embed the Agent

**Goal**: Get the agent visible and working on localhost.

### 1.1 Detect the Project

Examine the user's codebase:
- Check `package.json` for framework (React, Vue, Next.js, Vite, etc.)
- Find the main entry point (App.tsx, index.html, main layout)
- Note the dev server port (Vite: 5173, Next.js: 3000, CRA: 3000)

### 1.2 Install the Package

```bash
npm install @mcp-b/embedded-agent
```

### 1.3 Add the Component

**For React / Next.js:**
```jsx
import "@mcp-b/embedded-agent/web-component";

function App() {
  return (
    <>
      {/* Your app content */}
      <webmcp-agent anthropic-api-key="sk-ant-..." />
    </>
  );
}
```

**For Vue:**
```vue
<script setup>
import "@mcp-b/embedded-agent/web-component";
</script>

<template>
  <webmcp-agent anthropic-api-key="sk-ant-..." />
</template>
```

**For plain HTML:**
```html
<script src="https://unpkg.com/@mcp-b/embedded-agent/dist/web-component-standalone.iife.js" defer></script>
<webmcp-agent anthropic-api-key="sk-ant-..."></webmcp-agent>
```

### 1.4 Get the API Key

Ask the user: **"What's your Anthropic API key?"**

If they don't have one, direct them to: https://console.anthropic.com/

**Important**: The `anthropic-api-key` attribute only works on localhost. This is intentional - it's for development only. For production, they'll use SSO with `auth-token`.

### 1.5 Verify It Works

1. Start the dev server if not running
2. Navigate to the app: `mcp__chrome-devtools__navigate_page({ url: "http://localhost:PORT" })`
3. Take a screenshot: `mcp__chrome-devtools__take_screenshot`
4. Look for the agent bubble in the corner

If there are errors, check the console: `mcp__chrome-devtools__list_console_messages({ types: ["error"] })`

**Checkpoint**: The agent should appear as a chat bubble. Click it to open the chat interface.

---

## Step 2: Style the Agent

**Goal**: Make the agent match the user's brand.

The agent uses CSS custom properties for theming. It renders in Shadow DOM, so you can't select internal elements - only set variables on the host.

### 2.1 Extract Brand Colors

Look at the user's existing CSS or Tailwind config for:
- Primary/accent color
- Background color
- Text/foreground color
- Border color
- Border radius

### 2.2 Apply CSS Variables

Add styles targeting the `webmcp-agent` element:

```css
webmcp-agent {
  --char-color-primary: #0f766e;           /* Brand accent */
  --char-color-primary-foreground: #ffffff;
  --char-color-background: #ffffff;        /* Chat background */
  --char-color-foreground: #0f172a;        /* Text color */
  --char-color-muted: #f1f5f9;             /* Secondary surfaces */
  --char-color-border: #e2e8f0;            /* Borders */
  --char-radius: 0.75rem;                  /* Border radius */
}
```

### 2.3 Dark Mode (Optional)

If the app supports dark mode:

```css
html.dark webmcp-agent,
[data-theme="dark"] webmcp-agent {
  --char-color-background: #0f172a;
  --char-color-foreground: #e2e8f0;
  --char-color-muted: #1e293b;
  --char-color-border: #334155;
}
```

### 2.4 More Styling Options

For advanced customization (message bubbles, fonts, etc.), search the Char docs:
```
mcp__char-docs__SearchChar({ query: "CSS variables styling reference" })
```

**Checkpoint**: The agent should now match the app's visual style.

---

## Step 3: Create Your First WebMCP Tool

**Goal**: Let the agent interact with the UI.

WebMCP tools are functions you expose to the AI. When the user asks the agent to do something, it can call your tools to make it happen - filling forms, clicking buttons, reading data.

### 3.1 Understand the Pattern

Every WebMCP tool has:
- **name**: What the AI calls it (snake_case)
- **description**: How the AI knows when to use it
- **inputSchema**: What parameters it accepts
- **execute**: What it actually does

### 3.2 Import the Global Polyfill

Before registering tools, import the polyfill:

```typescript
import '@mcp-b/global';
```

This makes `navigator.modelContext` available.

### 3.3 Pick Something Simple

Ask the user: **"What's one action you'd like the agent to help with?"**

Good first tools:
- Fill a form field
- Click a button
- Toggle a setting
- Navigate to a page section

### 3.4 Register the Tool

Example - a form fill tool:

```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'fill_contact_form',
  description: 'Fill out the contact form with user details',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Full name' },
      email: { type: 'string', description: 'Email address' },
      message: { type: 'string', description: 'Message content' },
    },
    required: ['name', 'email'],
  },
  async execute({ name, email, message }) {
    const form = document.querySelector('form.contact');
    if (!form) throw new Error('Contact form not found');

    form.querySelector('[name="name"]').value = name;
    form.querySelector('[name="email"]').value = email;
    if (message) {
      form.querySelector('[name="message"]').value = message;
    }

    return {
      content: [{ type: 'text', text: `Filled form for ${name}` }]
    };
  },
});
```

Example - a button click tool:

```typescript
navigator.modelContext.registerTool({
  name: 'add_to_cart',
  description: 'Add the current product to the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'Product ID to add' },
    },
    required: ['productId'],
  },
  async execute({ productId }) {
    const button = document.querySelector(`[data-product="${productId}"] .add-to-cart`);
    if (!button) throw new Error(`Product ${productId} not found`);

    button.click();

    return {
      content: [{ type: 'text', text: `Added product ${productId} to cart` }]
    };
  },
});
```

### 3.5 Test the Tool

1. Refresh the page
2. List registered tools: `mcp__chrome-devtools__list_webmcp_tools`
3. Test it directly: `mcp__chrome-devtools__call_webmcp_tool({ name: "fill_contact_form", arguments: { name: "Test User", email: "test@example.com" } })`
4. Take a screenshot to verify: `mcp__chrome-devtools__take_screenshot`

### 3.6 More Tool Patterns

For React hooks, Zod schemas, and advanced patterns, search the WebMCP docs:
```
mcp__webmcp-Docs__SearchWebMcpDocumentation({ query: "registerTool React useWebMCP" })
```

**Checkpoint**: The agent can now perform at least one action in the UI.

---

## Summary

After completing all three steps, provide the user with:

**What's working:**
- Agent embedded and visible on localhost
- Styled to match the app
- First WebMCP tool registered

**Next steps:**
- **Add more tools**: Search `mcp__webmcp-Docs__SearchWebMcpDocumentation` for patterns
- **Production auth**: Set up SSO - search `mcp__char-docs__SearchChar({ query: "identity provider SSO" })`
- **Advanced styling**: Search `mcp__char-docs__SearchChar({ query: "CSS variables" })`

**Useful doc links:**
- Char docs: https://docs.meetchar.ai
- WebMCP docs: https://docs.mcp-b.ai
- Agent attributes: https://docs.meetchar.ai/reference/agent-attributes
- Tool registration: https://docs.mcp-b.ai/concepts/tool-registration
