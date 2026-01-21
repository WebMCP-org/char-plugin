# Embedding Reference

Detailed framework-specific examples for embedding the Char agent.

## React / Next.js

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

### Next.js App Router (Client Component)

```jsx
'use client';
import "@mcp-b/embedded-agent/web-component";

export default function ChatWidget() {
  return <webmcp-agent anthropic-api-key="sk-ant-..." />;
}
```

### TypeScript Declarations

If you get TypeScript errors for the custom element, add declarations:

```typescript
// types/webmcp.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'webmcp-agent': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'anthropic-api-key'?: string;
        'auth-token'?: string;
        open?: boolean;
      },
      HTMLElement
    >;
  }
}
```

## Vue

```vue
<script setup>
import "@mcp-b/embedded-agent/web-component";
</script>

<template>
  <webmcp-agent anthropic-api-key="sk-ant-..." />
</template>
```

### Vue 3 with TypeScript

```typescript
// vite.config.ts
export default defineConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'webmcp-agent'
      }
    }
  }
});
```

## Plain HTML / CDN

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <!-- Your content -->

  <script src="https://unpkg.com/@mcp-b/embedded-agent/dist/web-component-standalone.iife.js" defer></script>
  <webmcp-agent anthropic-api-key="sk-ant-..."></webmcp-agent>
</body>
</html>
```

## Svelte

```svelte
<script>
  import "@mcp-b/embedded-agent/web-component";
</script>

<webmcp-agent anthropic-api-key="sk-ant-..." />
```

## Agent Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `anthropic-api-key` | string | API key for localhost development |
| `auth-token` | string | JWT token for production (SSO) |
| `open` | boolean | Start with chat panel open |
| `dev-mode` | boolean | Enable debug logging |

### Localhost Restrictions

The `anthropic-api-key` attribute **only works on localhost**:
- `http://localhost:*`
- `http://127.0.0.1:*`

For any other origin, you must use `auth-token` with SSO.

## Common Issues

### Agent not appearing

1. Check the script tag is in your HTML
2. Verify you're on localhost if using `anthropic-api-key`
3. Check browser console for errors
4. Ensure the import runs (check network tab for the script)

### Custom element not recognized

- React: No action needed, web components work out of the box
- Vue: Configure `isCustomElement` in vite/webpack config
- Angular: Add `CUSTOM_ELEMENTS_SCHEMA` to your module

## Documentation

For complete attribute reference:
```
mcp__char-docs__SearchChar({ query: "agent attributes reference" })
```
