# Common Setup Recipes

Quick copy-paste patterns for common Char integration scenarios.

---

## Recipe 1: Basic Demo Page

**Goal**: Create a working Char demo in 30 seconds

**When to use**: Testing, learning, or quick prototypes

**Steps**:
1. Ask: "Create a Char demo page"
2. Provide your Anthropic API key when prompted
3. Open the generated demo.html in Chrome/Edge

**Expected result**:
- HTML file created with contact form and counter
- Char widget visible in bottom-right
- Console shows: `✅ Char embedded agent initialized!`
- Agent can interact with form elements

**Example request**:
```
Create a Char demo page for testing WebMCP tools
```

---

## Recipe 2: Add to Existing Website

**Goal**: Integrate Char into your live website

**When to use**: Adding AI chat to production site

**Prerequisites**:
- Existing HTML file or website
- Anthropic API key (dev mode) OR auth token (production)

**Steps**:
1. Ask: "Add Char to my website at /path/to/index.html"
2. Skill adds widget code before `</body>`
3. Injects API key (dev mode) or auth token placeholder (production)
4. Verify in browser console

**What gets added** (choose one):
```html
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>
<char-agent auth-token="YOUR_AUTH_TOKEN"></char-agent>
```

```html
<char-agent
  dev-mode='{"anthropicApiKey": "sk-ant-..."}'>
</char-agent>
```

**Example request**:
```
Add Char to my homepage at ~/my-site/index.html
```

---

## Recipe 3: Visual Integration (Match Your Brand)

**Goal**: Automatically match Char's styling to your website's design

**When to use**: Ensuring visual consistency

**Prerequisites**:
- Chrome DevTools MCP installed
- Website with consistent design (colors, fonts, border radius)

**Steps**:
1. Ask: "Set up Char and match my page's design at /path/to/page.html"
2. Skill analyzes page styles automatically
3. Extracts colors, fonts, border radius
4. Generates matching CSS variable overrides
5. Takes before/after screenshots
6. Applies CSS variables to Char widget

**What happens**:
```
📸 Taking baseline screenshot...
🎨 Extracting page styles...
   Primary: #667eea
   Background: #ffffff
   Font: -apple-system, BlinkMacSystemFont, 'Segoe UI'
   Radius: 8px
⚙️  Generating CSS variables...
✨ Applying CSS variables to Char...
📸 Taking verification screenshots (collapsed, expanded, mobile)
✅ Visual integration complete!
```

**Example request**:
```
Set up Char on my landing page and make sure it matches the purple gradient style
```

---

## Recipe 4: Add Char to Any Website (Custom Element)

**Goal**: Embed the Char AI agent using a simple `` custom element

**When to use**: ANY website (framework-agnostic)

**Prerequisites**:
- Modern browser (Chrome 90+, Firefox 95+, Safari 15+)
- Anthropic API key for dev mode

**Installation** (Choose one):

**Option A: CDN (Recommended - Zero Configuration)**
```html
<!-- Just add this script tag - that's it! -->
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>

<char-agent
  dev-mode='{"anthropicApiKey":"sk-ant-..."}'>
</char-agent>
```

**Option B: NPM Install** (For bundlers)
```bash
npm install @mcp-b/char
```

```html
<script type="module">
  import '@mcp-b/char/web-component'
</script>

<char-agent
  dev-mode='{"anthropicApiKey":"sk-ant-..."}'>
</char-agent>
```

**Complete Example**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>My App with Char</title>
</head>
<body>
  <h1>My Application</h1>
  <p>Your app content here...</p>

  <!-- Add Char agent (auto-registers, zero config) -->
  <script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>

  <char-agent
    dev-mode='{"anthropicApiKey":"sk-ant-api03-your-key-here"}'>
  </char-agent>
</body>
</html>
```

**With CSS Variable Customization**:
```html
<style>
  char-agent {
    --char-color-primary: #8b5cf6;
    --char-radius: 12px;
  }
</style>

<char-agent dev-mode='{"anthropicApiKey":"sk-ant-..."}'></char-agent>
```

**Why This Approach?**
- ✅ **Zero configuration** - No build tools, no framework setup
- ✅ **Framework agnostic** - Works everywhere
- ✅ **Shadow DOM** - Styles are always isolated
- ✅ **Auto-updating** - CDN serves latest version
- ✅ **Type-safe** - TypeScript definitions included

**Example request**:
```
Add Char to my website
```

---

## Recipe 5: Production Setup (auth-token)

**Goal**: Use auth-token for production usage

**When to use**: Production websites with persistent conversations

**Prerequisites**:
- Auth token from your auth system

**Steps**:
1. Copy your auth token
2. Pass `auth-token` to the widget
3. Remove `dev-mode` from production

**Code**:
```html
<char-agent auth-token="YOUR_AUTH_TOKEN"></char-agent>
```

**See**: [PRODUCTION.md](./PRODUCTION.md) for complete deployment guide

**Example request**:
```
I'm ready to move from dev mode to production with auth-token - walk me through it
```

---

## Recipe 6: Custom WebMCP Tools (Framework-Agnostic)

**Goal**: Register page-specific tools that your embedded agent can use

**When to use**: Adding custom automation for your specific application

**Prerequisites**:
- `@mcp-b/global` installed

**Installation**:
```bash
npm install @mcp-b/global
```

**Example** - Add a "fill login form" tool using vanilla registration:

```typescript
const modelContext = window.navigator?.modelContext;
if (!modelContext?.registerTool) {
  throw new Error('navigator.modelContext.registerTool is not available. Did you import @mcp-b/global first?');
}

modelContext.registerTool({
  name: 'fill_login_form',
  description: 'Fill the login form with credentials',
  inputSchema: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'Username or email' },
      password: { type: 'string', description: 'Password' },
    },
    required: ['username', 'password'],
  },
  execute: async ({ username, password }) => {
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');

    if (!usernameInput || !passwordInput) {
      throw new Error('Login inputs not found');
    }

    usernameInput.value = username;
    passwordInput.value = password;
    return {
      content: [{ type: 'text', text: 'Login form filled' }],
    };
  },
});
```

**Now your agent can**:
- See these tools when on the login page
- Call: `fill_login_form({ username: "test@example.com", password: "password123" })`
- Add a `submit_login()` tool if you want explicit form submission

**Progressive Disclosure**: Register tools only on pages where they apply.

---

## Recipe 7: Dark Mode Support

**Goal**: Char matches user's dark/light mode preference

**When to use**: Sites with dark mode toggle

**Auto-detection** (recommended):
```html
<style>
  char-agent {
    --char-color-background: #ffffff;
    --char-color-foreground: #111827;
    --char-color-primary: #667eea;
  }

  @media (prefers-color-scheme: dark) {
    char-agent {
      --char-color-background: #111827;
      --char-color-foreground: #e5e7eb;
      --char-color-primary: #a78bfa;
    }
  }
</style>

<char-agent dev-mode='{"anthropicApiKey":"sk-ant-..."}'></char-agent>
```

**Example request**:
```
Set up Char with dark mode support that follows the user's system preference
```

---

## Recipe 8: Multiple Agents on One Page

**Goal**: Run multiple specialized agents (e.g., sales, support, FAQ)

**When to use**: Different agent personalities or knowledge bases

**Note**: Multiple widgets are possible but not recommended. Keep one primary widget unless you have a strong reason.

**Code**:
```html
<!-- Sales Agent -->
<char-agent
  id="sales-agent"
  dev-mode='{"anthropicApiKey": "sk-ant-..."}'
  style="--char-color-primary: #10b981;">
</char-agent>

<!-- Support Agent -->
<char-agent
  id="support-agent"
  dev-mode='{"anthropicApiKey": "sk-ant-..."}'
  style="--char-color-primary: #ef4444;">
</char-agent>
```

Each agent has independent conversation history and can have different tools/knowledge.

---

## Recipe 9: Testing WebMCP Tools

**Goal**: Verify WebMCP browser automation works correctly

**When to use**: After setup, before deployment

**Manual test**:
1. Open demo page in Chrome/Edge
2. Open DevTools console (F12)
3. Click Char widget
4. Try these commands:
   - "Fill out the form with test data"
   - "Click the increment button 5 times"
   - "What's the current counter value?"
   - "Take a screenshot of this page"

**Expected results**:
- Form fields populate automatically
- Counter increments to 5
- Agent reports counter value accurately
- Screenshot saved/shown

**With Chrome DevTools MCP** (automated):
```
Ask the skill: "Verify WebMCP tools are working"
```

The skill runs automated tests and reports success/failure.

---

## Recipe 10: Troubleshooting Common Issues

**Goal**: Quickly diagnose and fix setup problems

**Problem**: Widget doesn't appear

**Solution checklist**:
```bash
# 1. Check console for errors
# Open DevTools (F12) → Console tab
# Look for: import errors, CORS errors, API key errors

# 2. Verify CDN is accessible
# Check Network tab: https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js should load (200 OK)

# 3. Confirm API key format
# Should start with: sk-ant-api03-...

# 4. Check browser compatibility
# Chrome/Edge 90+, Firefox 88+, Safari 14+

# 5. Verify serving over HTTP/HTTPS (not file://)
python -m http.server 8000  # Then open http://localhost:8000
```

**See**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for complete guide

---

## Recipe 11: Live Preview on Customer Site (CDP)

**Goal**: Preview what Char looks like on any live website without touching their code

**When to use**: Sales demos, customer onboarding, design verification

**Prerequisites**:
- Chrome DevTools MCP installed
- Target site accessible in Chrome

**Steps**:
1. Ask: "Preview what Char looks like on https://example.com/dashboard"
2. Skill navigates to the page and extracts design tokens
3. Fetches the Char IIFE bundle from jsdelivr CDN
4. Injects a themed collapsible sidebar with matching colors
5. Takes before/after screenshots (light + dark mode)

**What happens**:
```
📸 Navigating to target page...
🎨 Extracting CSS variables (light + dark)...
📐 Mapping DOM structure...
📦 Fetching Char bundle from jsdelivr...
💉 Injecting themed sidebar...
📸 Screenshots: light mode, dark mode
✅ Live preview complete!
```

**Result**: A fully themed Char sidebar on their live site — content pushes left when opened, just like the real integration would look.

**See**: [LIVE_PREVIEW.md](./LIVE_PREVIEW.md) for the complete step-by-step workflow

**Example requests**:
```
Preview what Char looks like on https://app.example.com
Show me Char on my site at https://myapp.dev/dashboard
Inject Char into the live page at https://staging.example.com
```

---

## Quick Tips

**Fastest setup**:
```
"Create a Char demo page" → Provide API key → Done
```

**Best visual match**:
```
"Set up Char matching my page's design" (requires Chrome DevTools MCP)
```

**Production checklist**:
1. Use `auth-token` (not devMode)
2. Enable HTTPS
3. Monitor usage and logs
4. Test at scale

**Getting help**:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [CUSTOMIZATION.md](./CUSTOMIZATION.md) - Styling reference
- [VISUAL_INTEGRATION.md](./VISUAL_INTEGRATION.md) - Design tips
- [WEBMCP_REFERENCE.md](./WEBMCP_REFERENCE.md) - Tool docs
- [PRODUCTION.md](./PRODUCTION.md) - Deployment guide

---

**Need something not covered here?** Ask the char-setup skill directly - it adapts to your specific needs.
