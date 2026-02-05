# Troubleshooting Guide

Common issues and solutions when setting up Char with WebMCP tools.

---

## Embedded Agent Not Appearing

### Problem
The chat widget doesn't show up on the page.

### Solutions

**1. Check browser console for errors**
```javascript
// Open DevTools (F12) and look for:
// - Module loading errors
// - CORS errors
// - Network request failures
```

**2. Verify CDN links are accessible**
```html
<!-- These should load successfully -->
<script src="https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js" defer></script>
```

**3. Check API key format**
```javascript
// Anthropic API keys start with 'sk-ant-'
anthropicApiKey: 'sk-ant-api03-...'
```

**4. Ensure you're serving over HTTP/HTTPS**
```bash
# ❌ Won't work
file:///path/to/demo.html

# ✅ Works
http://localhost:3000/demo.html
```

---
---

## WebMCP Tools Not Working

### Problem
Agent says "I don't have access to browser automation tools" or tools fail silently.

### Solutions

**1. Verify Chrome DevTools MCP server is running**

Check if the MCP server is active in Claude Code settings.

**2. Check browser compatibility**

WebMCP requires:
- Chrome 90+ or Edge 90+
- Not supported in Firefox or Safari

**3. Confirm page is served locally or over HTTPS**

WebMCP tools require secure context:
```
✅ http://localhost:*
✅ https://*
❌ file:///*
❌ http://remote-ip-address:*
```

**4. Look for CSP violations**

If your page has Content Security Policy headers, they may block WebMCP:

```html
<!-- Allow WebMCP scripts -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
               connect-src 'self' https://app.usechar.ai;">
```

---

## Agent Responds But Can't Interact

### Problem
Agent acknowledges requests but says it can't click buttons or fill forms.

### Solutions

**1. Ensure elements are interactive**

Elements need proper semantic HTML:
```html
<!-- ✅ Good -->
<button id="submit">Submit</button>
<input type="text" id="name" />

<!-- ❌ May not work -->
<div onclick="submit()">Submit</div>
```

**2. Wait for dynamic content**

If page loads content asynchronously:
```javascript
// Add data attributes when content is ready
document.getElementById('app').setAttribute('data-ready', 'true')
```

Then agent can wait:
```javascript
wait_for({ text: "Page loaded" })
```

**3. Check z-index conflicts**

Make sure page elements aren't covered by other elements:
```css
/* Ensure form is clickable */
#contact-form {
  position: relative;
  z-index: 1;
}
```

---

## API Key Errors

### Problem
"Invalid API key" or "Authentication failed" errors.

### Solutions

**1. Verify API key is correct**

Get your key from: https://console.anthropic.com/settings/keys

**2. Check for whitespace**

```javascript
// ❌ Has newline
anthropicApiKey: 'sk-ant-api03-...\n'

// ✅ Trimmed
anthropicApiKey: 'sk-ant-api03-...'.trim()
```

**3. Ensure key has correct permissions**

Some API keys may have restricted access. Create a new key with full permissions.

**4. Check rate limits**

Free tier has limits. Wait a moment and try again, or upgrade your plan.

---

## Network/CORS Errors

### Problem
"Cross-Origin Request Blocked" or "CORS policy" errors.

### Solutions

**1. For local development, use a dev server**

```bash
# Don't open HTML files directly
# ❌ file:///path/to/demo.html

# Use a local server instead
# ✅ Python
python -m http.server 8000

# ✅ Node.js
npx serve .

# ✅ PHP
php -S localhost:8000
```

**2. Configure CORS for API requests**

If making external API calls, ensure endpoints allow your origin.

**3. Check if browser extensions are interfering**

Try in incognito/private mode to rule out extension conflicts.

---

## Styling Issues

### Problem
Widget appears but looks broken or unstyled.

### Solutions

**1. Shadow DOM limitations**

Shadow DOM is always enabled. You cannot target internal elements with selectors. Style the widget via CSS variables on ``.

**2. Check for CSS conflicts**

Your page styles may override widget styles:
```css
/* Scope your styles to avoid conflicts */
.my-app {
  /* Your styles here */
}

/* Don't use global resets that affect everything */
```

**3. Verify CDN is accessible**

Open `https://cdn.jsdelivr.net/npm/@mcp-b/char@latest/dist/web-component-standalone.iife.js` in the browser to confirm it loads.

---

## Performance Issues

### Problem
Page is slow or agent responses are delayed.

### Solutions

**1. Check API key usage**

Stateless mode charges your API key. Monitor usage at:
https://console.anthropic.com/settings/usage

**2. Reduce concurrent operations**

Don't have agent perform too many actions at once.

**3. Optimize page resources**

Heavy page resources slow down WebMCP tools:
- Minimize large images
- Reduce JavaScript bundles
- Use lazy loading

**4. Use production builds**

Development mode loads unminified code. For production, use optimized builds.

---

## Browser DevTools Tips

### See What WebMCP is Doing

Open Chrome DevTools (F12) while agent is working:

**Console tab:**
- WebMCP tool calls logged
- Agent responses
- Error messages

**Network tab:**
- API requests to Anthropic
- CDN resource loading
- Failed requests

**Elements tab:**
- Inspect what agent is interacting with
- Check element UIDs
- Verify accessibility tree

---

## Still Having Issues?

### Debug Checklist

- [ ] API key is valid and starts with `sk-ant-`
- [ ] Page is served over HTTP/HTTPS (not `file://`)
- [ ] Browser console shows no errors
- [ ] Chrome/Edge browser (not Firefox/Safari)
- [ ] CDN resources load successfully
- [ ] No ad blockers or extensions interfering
- [ ] Elements are properly structured HTML
- [ ] CSP headers allow required scripts

### Get Help

1. **Check the console** - Most issues show errors there
2. **Try the demo page first** - Rule out your code
3. **Test with minimal setup** - Isolate the problem
4. **Review WEBMCP_REFERENCE.md** - Verify tool usage

### Report Bugs

If you've found a bug in CAR or WebMCP:

1. Create a minimal reproduction case
2. Include browser version and console errors
3. Share the page HTML if possible
4. File an issue at: https://github.com/WebMCP-org/char-ai-saas/issues
