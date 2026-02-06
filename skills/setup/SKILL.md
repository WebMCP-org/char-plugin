---
name: char-setup
version: 3.0.0
description: Set up Char - an AI agent platform with WebMCP browser automation tools and embedded chat widgets. Use when the user wants to add Char to their website, set up WebMCP tools, integrate the embedded agent widget, or add AI chat functionality with browser automation.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, mcp__chrome-devtools__*, mcp__char-docs__*, mcp__webmcp-Docs__*, mcp__char-saas-staging__*
---

# Char Setup Assistant

Guides you through integrating Char AI agents into websites with WebMCP browser automation tools.

## Quick Reference

| Task | Command/Action | Where |
|------|---------------|-------|
| **Install Chrome DevTools MCP** | `claude mcp add --transport stdio chrome-devtools -- npx -y @mcp-b/chrome-devtools-mcp` | Terminal |
| **Create demo page** | Ask: "Create a Char demo page" | This skill auto-creates |
| **Add to existing page** | Ask: "Add Char to my index.html" | This skill adds widget |
| **Match page design** | Ask: "Set up Char matching my page's style" | Auto-maps CSS variables |
| **Live preview on any site** | Ask: "Preview Char on https://example.com" | CDP injection |
| **Verify setup** | Look for `✅ Char embedded agent initialized!` | Browser console |
| **Customize styling** | See [CUSTOMIZATION.md](references/CUSTOMIZATION.md) | Reference docs |
| **Write WebMCP tools** | Use the `/char:webmcp` skill | Separate skill |
| **Troubleshoot** | See [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) | Reference docs |

## Success Criteria

After setup, you should see:

✅ **Page loads successfully**
- HTML file opens in browser without errors

✅ **Widget appears**
- `` renders and the chat UI opens

✅ **Console confirms initialization**
```
✅ Char embedded agent initialized!
💡 Try saying: "Fill out the contact form with test data"
```

✅ **Agent responds**
- Click the pill, type a message, get a response

✅ **WebMCP tools work**
- Agent can interact with page elements (click, fill forms)

If any check fails, see [Troubleshooting](references/TROUBLESHOOTING.md).

## What is Char?

**Char** is an AI agent platform for embedding conversational agents on websites with:
- **WebMCP tools** - Browser automation (click, fill forms, navigate, screenshot)
- **Embedded agent widget** - Drop-in chat UI powered by `@mcp-b/char`
- **Auth-token mode** - Production embed using your auth token
- **Dev mode** - Quick start using your own Anthropic API key (no backend needed)

**Note:** Use the `` web component for embedding.

## Prerequisites

### Required
- This skill (you're already using it!)
- Anthropic API key (for devMode)
- Chrome, Edge, or Chromium 90+
- Node.js 14+ (for verification script)

### Verify Prerequisites

Run the verification script to check your setup:

```bash
node scripts/verify-setup.js

# Optional: Check API key format
node scripts/verify-setup.js --check-api-key sk-ant-...
```

Expected output:
```
✓ Node.js 24.11.1 (>= 14.0.0)
✓ Google Chrome 120 found (>= 90)
✓ Demo template found
✓ Network connectivity to api.anthropic.com
✓ All required checks passed!
```

### Optional MCP Servers (Recommended)

**Chrome DevTools MCP** - Enables automated browser testing and visual integration:
```bash
claude mcp add --transport stdio chrome-devtools -- \
  npx -y @mcp-b/chrome-devtools-mcp
```
Verify installation: `/mcp` and look for `chrome-devtools`

**MCPB Documentation (WebMCP Server)** - Source of truth for WebMCP API names/signatures (do not guess):
```bash
# Check if installed:
/mcp
# Look for a WebMCP Server / MCPB documentation tool
```

## Quick Start

The fastest path is **dev mode** - works immediately with your Anthropic API key.
For production, use **auth-token** (see [references/PRODUCTION.md](references/PRODUCTION.md)).

1. I'll check which MCP servers are available
2. Create an HTML page with Char embedded agent
3. Inject your API key
4. Verify setup (automated if Chrome DevTools MCP available, manual otherwise)

## Setup Workflow

**CRITICAL - Check MCP Availability First:**
Before starting, I'll check which MCP servers are available by examining available tools. This determines the testing approach. If the MCPB documentation (WebMCP Server) is available, use it to verify API names/signatures before writing tool registration code.

### Step 1: Auto-detect or Create Demo Page

**If you have an existing HTML page:**
- Tell me the path and I'll add Char to it

**If starting fresh:**
- I'll create a minimal demo page from [assets/templates/demo.html](assets/templates/demo.html)
- The template includes a contact form and interactive counter for testing

### Step 2: Add Char Embedded Agent Widget

**First, install the package:**

```bash
npm install @mcp-b/char @mcp-b/global
```

**Then add the widget to your page.**

**Recommended: Collapsible sidebar** (pushes content left when opened):

```html
<!-- Your app shell — outermost flex container -->
<div style="display: flex; height: 100vh; width: 100%; overflow: hidden;">
  <!-- Your existing content -->
  <div style="display: flex; min-width: 0; flex: 1;">
    <!-- sidebar, main content, etc. -->
  </div>

  <!-- Char agent panel — flex sibling, animates between 420px and 0 -->
  <div id="char-panel" style="flex-shrink: 0; overflow: hidden; border-left: 1px solid transparent; transition: width 0.2s ease-out; width: 0;">
    <div style="width: 420px; height: 100%;">
      <char-agent auth-token="YOUR_AUTH_TOKEN"></char-agent>
    </div>
  </div>
</div>
```

**Alternative: Fixed overlay** (for simple pages without flex layout):

```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>
<style>
  char-agent {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    z-index: 9999;
  }
</style>
<char-agent auth-token="YOUR_AUTH_TOKEN"></char-agent>
```

For stateless devMode (testing only):

```html
<char-agent dev-mode='{"anthropicApiKey": "YOUR_API_KEY"}'></char-agent>
```

For bundlers (Vite/Next/etc.), import the web component in your entry file:

```ts
import '@mcp-b/char/web-component';
```

**Shadow DOM note:** The widget always renders inside Shadow DOM. WebMCP tools cannot target elements inside the widget. Treat it as a black box and customize via CSS variables on ``.

### Step 2.5: Match Host Page Styling (CRITICAL)

**The widget MUST visually blend with the host page!**

Extract the host page's design tokens and apply them as CSS variables:

```typescript
// Add this code after the widget is loaded (in your main.ts/main.js)
const bodyStyles = getComputedStyle(document.body);
const linkElement = document.querySelector('a');
const linkColor = linkElement ? getComputedStyle(linkElement).color : '#646cff';

const agent = document.querySelector('char-agent') as HTMLElement;
if (agent) {
  agent.style.setProperty('--char-color-background', bodyStyles.backgroundColor);
  agent.style.setProperty('--char-color-foreground', bodyStyles.color);
  agent.style.setProperty('--char-color-primary', linkColor);
  agent.style.setProperty('--char-color-muted', bodyStyles.backgroundColor);
}
```

**Or apply directly in HTML:**

```html
<char-agent
  style="
    --char-color-background: #1a1a1a;
    --char-color-foreground: rgba(255, 255, 255, 0.87);
    --char-color-primary: #646cff;
    --char-color-muted: #242424;
  "
  dev-mode='{"anthropicApiKey":"..."}'>
</char-agent>
```

**Available CSS variables:**
- `--char-color-background` - Main background color
- `--char-color-foreground` - Main text color
- `--char-color-primary` - Brand/accent color (buttons, links)
- `--char-color-muted` - Secondary background color
- `--char-color-border` - Border colors
- Many more - see [CUSTOMIZATION.md](references/CUSTOMIZATION.md)

**If you skip this step, the widget will look jarring and out of place!**

### Step 3: Verify WebMCP Tools

**Path A: With Chrome DevTools MCP (Automated)**

If Chrome DevTools MCP is available, I'll run automated tests to verify:
- ✅ Page loads correctly
- ✅ Embedded agent initializes
- ✅ Form elements are clickable
- ✅ WebMCP tools are functional

**Path B: Without Chrome DevTools MCP (Manual)**

If Chrome DevTools MCP is not available, I'll provide manual testing instructions:

1. Open `demo.html` in Chrome/Edge
2. Open DevTools (F12) → Console tab
3. Look for: `✅ Char embedded agent initialized!`
4. Click the chat widget (bottom-right)
5. Try: "Fill out the contact form with test data"
6. Verify the agent can interact with the page

**Recommendation:** Install Chrome DevTools MCP for automated testing in future setups.

### Step 4: Launch in Browser

I'll use the `open` command (macOS) or `start` (Windows) to launch your page in the default browser.

If you have a local dev server running, I'll navigate to that URL instead.

## Visual Integration (Chrome DevTools MCP)

When Chrome DevTools MCP is available, I can automatically analyze your page's design and generate matching CSS variable overrides for Char.

**What I'll do:**
1. **Extract page styles** - Colors, fonts, border radius, and design patterns
2. **Generate matching styles** - Map your styles to Char's CSS variables
3. **Take screenshots** - Before/after verification at desktop and mobile viewports
4. **Check accessibility** - Verify contrast ratios meet WCAG AA standards

**Example output:**
```
🎨 Extracted: Primary #667eea, Background #fff, Font: system-ui
⚙️  Generated CSS variables with matching colors and typography
📸 Screenshots: collapsed, expanded, mobile viewports
✅ Visual integration complete!
```

See [Visual Integration Guide](references/VISUAL_INTEGRATION.md) for the complete workflow, best practices, and detailed examples.

## Live Preview (Chrome DevTools MCP)

Preview what Char looks like on **any live website** — without touching their codebase. Uses CDP to extract design tokens, inject the Char bundle, and build a themed collapsible sidebar.

**What I'll do:**
1. **Navigate** to the target URL and screenshot
2. **Extract** CSS custom properties (light + dark mode)
3. **Fetch** the Char IIFE bundle from jsdelivr CDN
4. **Inject** themed sidebar as a flex sibling (pushes content left)
5. **Screenshot** the result in both themes

**Example:**
```
"Preview what Char looks like on https://app.example.com/dashboard"
```

**Result:** A fully themed Char sidebar on their live site — realistic preview of the final integration.

See [Live Preview Guide](references/LIVE_PREVIEW.md) for the complete step-by-step workflow and gotchas.

## WebMCP Tools Reference

Once set up, your embedded agent can use these tools:

| Tool | What It Does |
|------|--------------|
| `click` | Click buttons, links, elements |
| `fill` | Fill form inputs |
| `navigate` | Navigate to URLs |
| `take_snapshot` | Capture page text content |
| `take_screenshot` | Capture visual screenshot |
| `evaluate_script` | Run JavaScript on page |
| `hover` | Hover over elements |
| `press_key` | Keyboard input |

See [references/WEBMCP_REFERENCE.md](references/WEBMCP_REFERENCE.md) for complete tool documentation.

## Registering Custom WebMCP Tools

To create page-specific tools that your embedded agent can use, run `/char:webmcp` — the WebMCP tool-writing skill covers everything:
- Registration patterns (React, Vanilla JS)
- Read/fill and fill/submit form tools
- Navigation, read-only, and action tools
- Testing with Chrome DevTools MCP

## Examples

**Example 1: Add to existing page**
> "Add Char to my index.html file"

**Example 2: Create demo from scratch**
> "Create a Char demo page with a contact form"

**Example 3: Visual integration**
> "Set up Char and make sure it matches my page's design"

**Example 4: Live preview on a customer's site**
> "Preview what Char looks like on https://app.example.com/dashboard"

## Important Notes

- **API Key Security**: Never commit your Anthropic API key to git
- **Dev Mode Only**: Stateless mode is for development/testing
- **Production**: Use `auth-token` (see [references/PRODUCTION.md](references/PRODUCTION.md))
- **Browser Required**: You need Chrome/Edge for WebMCP tools to work
- **MCP Servers**: Optional but recommended for automated testing and visual integration

## Troubleshooting

See [references/TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) for common issues.

## Additional Resources

### Getting Started
- [RECIPES.md](references/RECIPES.md) - Common setup patterns (quick copy-paste examples)
- [Quick Reference](#quick-reference) - Command cheat sheet (this page)

### Configuration
- [CUSTOMIZATION.md](references/CUSTOMIZATION.md) - Complete theming and styling guide
- [VISUAL_INTEGRATION.md](references/VISUAL_INTEGRATION.md) - Design integration best practices
- [LIVE_PREVIEW.md](references/LIVE_PREVIEW.md) - Live preview via CDP injection (sales demos, onboarding)

### Implementation
- `/char:webmcp` skill - How to write custom WebMCP tools (patterns, testing, best practices)
- [TESTING_GUIDE.md](references/TESTING_GUIDE.md) - Testing procedures with Chrome DevTools MCP

### Reference
- [WEBMCP_REFERENCE.md](references/WEBMCP_REFERENCE.md) - Complete tool documentation
- [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) - Common issues and solutions

### Examples
- [EXAMPLE_INTEGRATION.md](references/EXAMPLE_INTEGRATION.md) - Complete Cypress RealWorld App integration

### Advanced
- [PRODUCTION.md](references/PRODUCTION.md) - Production deployment with stateful backend

### Development
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to improve this skill

---

**Next Steps After Setup:**
1. Chat with your embedded agent
2. Ask it to interact with your page
3. Watch WebMCP tools in action
4. Customize the widget styling
5. Move to production when ready
