# WebMCP Tools Reference

Patterns for registering tools that let the AI agent interact with your UI.

## Core Concept

WebMCP tools are functions you expose to the AI. When a user asks the agent to do something, it can call your tools to make it happen.

```
User: "Fill out the contact form with my info"
Agent: [calls fill_contact_form tool]
Tool: [fills the form, returns success]
Agent: "Done! I've filled out the form for you."
```

## Basic Pattern

```typescript
import '@mcp-b/global';

navigator.modelContext.registerTool({
  name: 'tool_name',
  description: 'What this tool does',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' },
    },
    required: ['param'],
  },
  async execute({ param }) {
    // Do something
    return {
      content: [{ type: 'text', text: 'Result message' }]
    };
  },
});
```

## Tool Anatomy

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Identifier the AI uses (snake_case) |
| `description` | Yes | How the AI knows when to use it |
| `inputSchema` | Yes | JSON Schema for parameters |
| `execute` | Yes | Async function that does the work |

### Name Conventions

- Use `snake_case`: `fill_form`, `add_to_cart`, `toggle_dark_mode`
- Be specific: `submit_contact_form` not `submit`
- Use verbs: `get_`, `set_`, `toggle_`, `navigate_`, `fill_`

### Description Best Practices

The description is how the AI decides when to use the tool:

```typescript
// Good - specific and actionable
description: 'Fill the contact form with name, email, and message fields'

// Bad - too vague
description: 'Helps with forms'
```

## Common Patterns

### Form Fill

```typescript
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

    (form.querySelector('[name="name"]') as HTMLInputElement).value = name;
    (form.querySelector('[name="email"]') as HTMLInputElement).value = email;
    if (message) {
      (form.querySelector('[name="message"]') as HTMLTextAreaElement).value = message;
    }

    return {
      content: [{ type: 'text', text: `Filled form for ${name}` }]
    };
  },
});
```

### Button Click

```typescript
navigator.modelContext.registerTool({
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'Product ID to add' },
    },
    required: ['productId'],
  },
  async execute({ productId }) {
    const button = document.querySelector(
      `[data-product="${productId}"] .add-to-cart`
    ) as HTMLButtonElement;

    if (!button) throw new Error(`Product ${productId} not found`);
    button.click();

    return {
      content: [{ type: 'text', text: `Added ${productId} to cart` }]
    };
  },
});
```

### Toggle State

```typescript
navigator.modelContext.registerTool({
  name: 'toggle_dark_mode',
  description: 'Toggle between light and dark mode',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');

    return {
      content: [{ type: 'text', text: `Dark mode ${isDark ? 'enabled' : 'disabled'}` }]
    };
  },
});
```

### Read Data

```typescript
navigator.modelContext.registerTool({
  name: 'get_cart_items',
  description: 'Get the current items in the shopping cart',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute() {
    const items = Array.from(document.querySelectorAll('.cart-item')).map(el => ({
      name: el.querySelector('.item-name')?.textContent,
      price: el.querySelector('.item-price')?.textContent,
      quantity: el.querySelector('.item-qty')?.textContent,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(items, null, 2)
      }]
    };
  },
});
```

### Navigation

```typescript
navigator.modelContext.registerTool({
  name: 'navigate_to_section',
  description: 'Scroll to a section of the page',
  inputSchema: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        enum: ['pricing', 'features', 'contact', 'about'],
        description: 'Section to navigate to'
      },
    },
    required: ['section'],
  },
  async execute({ section }) {
    const element = document.getElementById(section);
    if (!element) throw new Error(`Section ${section} not found`);

    element.scrollIntoView({ behavior: 'smooth' });

    return {
      content: [{ type: 'text', text: `Scrolled to ${section}` }]
    };
  },
});
```

## React Integration

### Using useEffect

```typescript
import { useEffect } from 'react';
import '@mcp-b/global';

function MyComponent() {
  useEffect(() => {
    const registration = navigator.modelContext.registerTool({
      name: 'component_action',
      description: 'Action specific to this component',
      inputSchema: { type: 'object', properties: {} },
      async execute() {
        return { content: [{ type: 'text', text: 'Done!' }] };
      },
    });

    return () => registration.unregister();
  }, []);

  return <div>My Component</div>;
}
```

### Using useWebMCP Hook

```typescript
import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

function ShoppingCart() {
  useWebMCP({
    name: 'add_to_cart',
    description: 'Add a product to the shopping cart',
    inputSchema: {
      productId: z.string(),
      quantity: z.number().min(1)
    },
    handler: async ({ productId, quantity }) => {
      await addToCart(productId, quantity);
      return { message: `Added ${quantity}x ${productId}` };
    }
  });

  return <div>{/* Cart UI */}</div>;
}
```

## Error Handling

Always throw descriptive errors:

```typescript
async execute({ productId }) {
  const product = document.querySelector(`[data-id="${productId}"]`);

  if (!product) {
    throw new Error(`Product with ID "${productId}" not found on page`);
  }

  const button = product.querySelector('.add-btn');
  if (!button) {
    throw new Error(`Add button not found for product "${productId}"`);
  }

  // ...
}
```

## Testing Tools

Use Chrome DevTools MCP to test:

```
# List registered tools
mcp__chrome-devtools__list_webmcp_tools

# Call a tool
mcp__chrome-devtools__call_webmcp_tool({
  name: "fill_contact_form",
  arguments: { name: "Test", email: "test@example.com" }
})

# Take screenshot to verify
mcp__chrome-devtools__take_screenshot
```

## Documentation

For more patterns:
```
mcp__webmcp-Docs__SearchWebMcpDocumentation({ query: "registerTool patterns examples" })
```
