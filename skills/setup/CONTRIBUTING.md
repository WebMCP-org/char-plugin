# Contributing to char-setup Skill

Thank you for your interest in improving the char-setup skill! This guide explains how to report issues, suggest improvements, and contribute code.

---

## Table of Contents

1. [Reporting Issues](#reporting-issues)
2. [Suggesting Features](#suggesting-features)
3. [Contributing Code](#contributing-code)
4. [Testing Changes](#testing-changes)
5. [Documentation](#documentation)
6. [Pull Request Process](#pull-request-process)

---

## Reporting Issues

### Bug Reports

When reporting a bug, please include:

1. **Description**: What went wrong?
2. **Steps to reproduce**: How can we see the bug?
3. **Expected behavior**: What should have happened?
4. **Actual behavior**: What actually happened?
5. **Environment**:
   - OS (macOS, Windows, Linux)
   - Browser (Chrome/Edge version)
   - Node.js version
   - MCP servers installed (Chrome DevTools, WebMCP Docs)
6. **Error messages**: Console output, stack traces
7. **Files** (if possible): Sanitized sample files that trigger the bug

### Example Bug Report

```markdown
**Bug**: Visual integration extracts wrong primary color

**Steps to reproduce:**
1. Create HTML page with primary button color #3b82f6
2. Run: "Set up Char matching my page's design"
3. Check generated CSS variables

**Expected**: `--char-color-primary: #3b82f6`
**Actual**: `--char-color-primary: #ffffff` (extracts background instead)

**Environment:**
- macOS Sonoma 14.2
- Chrome 120
- Chrome DevTools MCP v1.2.0 installed

**Error messages:**
```
No errors in console, extraction completes successfully
```

**Attachment:** test-page.html (simplified example)
```

---

## Suggesting Features

We welcome feature requests! Please include:

1. **Use case**: What problem does this solve?
2. **Current workaround**: How do you solve it now?
3. **Proposed solution**: What would you like to see?
4. **Alternatives considered**: Other approaches you thought about
5. **Priority**: How often would you use this?

### Example Feature Request

```markdown
**Feature**: Support for multiple page style profiles

**Use case**: Our site has different styles for landing, docs, and app sections. Each should have a different Char styling profile to match.

**Current workaround**: Manually edit CSS variables in each HTML file

**Proposed solution**:
```javascript
<char-agent data-style="landing"></char-agent>

<style>
  char-agent[data-style="landing"] { --char-color-primary: #3b82f6; }
  char-agent[data-style="docs"] { --char-color-primary: #10b981; }
  char-agent[data-style="app"] { --char-color-primary: #ef4444; }
</style>
```

**Alternatives considered:**
1. Multiple agent instances (heavy)
2. Style switching API (complex)

**Priority**: We update styles weekly, this would save ~2 hours/week
```

---

## Contributing Code

### Setup Development Environment

1. **Fork the repository** (if external contributor)

2. **Clone locally**:
```bash
git clone https://github.com/WebMCP-org/char-ai-saas.git
cd char-ai-saas/packages/claude-code-skill-char-setup/skills/char-setup
```

3. **Verify prerequisites**:
```bash
node scripts/verify-setup.js
```

4. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

### File Structure

```
char-setup/
├── SKILL.md                     # Main skill file (<500 lines)
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # This file
├── references/
│   ├── CUSTOMIZATION.md         # Styling reference
│   ├── VISUAL_INTEGRATION.md    # Design integration guide
│   ├── WEBMCP_REFERENCE.md      # Tool documentation
│   ├── TROUBLESHOOTING.md       # Common issues
│   ├── PRODUCTION.md            # Production deployment
│   └── RECIPES.md               # Common patterns
├── assets/
│   ├── templates/
│   │   └── demo.html            # Demo page template
│   └── scripts/
│       └── extract-page-styles.js  # Style extraction script
└── scripts/
    └── verify-setup.js          # Prerequisite verification
```

### Making Changes

**Guidelines:**

1. **Keep SKILL.md concise** (<500 lines, currently ~220)
   - Core workflow only
   - Link to reference files for details
   - Progressive disclosure pattern

2. **Add detailed docs to references/**
   - CUSTOMIZATION.md for styling
   - VISUAL_INTEGRATION.md for design patterns
   - TROUBLESHOOTING.md for issues
   - RECIPES.md for common use cases

3. **Update multiple files**:
   - SKILL.md: If workflow changes
   - CHANGELOG.md: Always document changes
   - README (if exists): For major features
   - Relevant reference files

4. **Follow existing patterns**:
   - Use same heading levels
   - Match code style (markdown, JavaScript)
   - Keep examples concrete, not abstract

### Code Style

**Markdown** (SKILL.md, references):
```markdown
## Section Heading (## for main sections)

### Subsection (### for subsections)

**Bold for emphasis**, *italic for terms*

Code blocks with language:
```javascript
const example = 'code';
```

Tables:
| Column 1 | Column 2 |
|----------|----------|
| Value    | Value    |

Links: [Text](path/to/file.md)
```

**JavaScript** (scripts):
```javascript
// Use ES6+ features
const myFunction = (param) => {
  // Clear variable names
  const result = processData(param);

  // Error handling
  if (!result) {
    console.error('Processing failed');
    return null;
  }

  return result;
};

// JSDoc comments for exported functions
/**
 * Extract page styles for style generation
 * @returns {Object} Extracted styles
 */
function extractPageStyles() {
  // ...
}
```

---

## Testing Changes

### Manual Testing

1. **Test with Claude Code**:
```bash
# Navigate to your skills directory
cd ~/.claude/skills/

# Link your development version (or copy)
ln -s /path/to/your/char-setup .

# Open Claude Code
# Ask: "What skills are available?"
# Should see: char-setup
```

2. **Test skill activation**:
```
User: "Create a Char demo page"
Expected: Skill activates automatically
```

3. **Test workflows**:
   - Basic setup (demo page creation)
   - Existing page integration
   - Visual integration (if Chrome DevTools MCP available)
   - Error handling (missing files, wrong paths)

4. **Test with different models**:
   - Claude Haiku (limited context)
   - Claude Sonnet (balanced)
   - Claude Opus (advanced)

### Automated Testing

Run verification script:
```bash
node scripts/verify-setup.js
```

Should pass all required checks.

### Testing Checklist

- [ ] SKILL.md is valid YAML frontmatter + markdown
- [ ] All file paths use forward slashes (/)
- [ ] All links resolve correctly
- [ ] Code examples are syntactically valid
- [ ] Scripts have error handling
- [ ] Skill activates on relevant requests
- [ ] Skill stays dormant on irrelevant requests
- [ ] References load progressively (not all at once)
- [ ] No breaking changes to existing workflows

---

## Documentation

### Updating Documentation

**When to update SKILL.md:**
- New workflow added
- Prerequisites changed
- Examples added/modified
- Quick Reference updated

**When to update reference files:**
- New styling options (CUSTOMIZATION.md)
- New visual patterns (VISUAL_INTEGRATION.md)
- New tools available (WEBMCP_REFERENCE.md)
- New issues discovered (TROUBLESHOOTING.md)
- New recipes (RECIPES.md)

**Always update:**
- CHANGELOG.md for every change
- Version in SKILL.md frontmatter (if breaking changes)

### Documentation Style

**Be specific:**
❌ "You can customize the widget"
✅ "Set `--char-color-primary` to match your brand color"

**Use examples:**
❌ "The skill can extract colors"
✅ "The skill extracts your brand color from buttons: `#667eea`"

**Link liberally:**
✅ "See [CUSTOMIZATION.md](references/CUSTOMIZATION.md) for complete styling guide"

---

## Pull Request Process

### Before Submitting

1. **Run verification**:
```bash
node scripts/verify-setup.js
```

2. **Test manually** (see Testing section)

3. **Update CHANGELOG.md**:
```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- What changed

### Fixed
- Bug fix description
```

4. **Update version** (if breaking changes):
```yaml
---
name: char-setup
version: 3.0.0  # Increment major version
---
```

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (requires version bump)
- [ ] Documentation update

## Testing
How did you test this?

Example:
- Tested demo page creation on macOS/Chrome
- Tested visual integration with sample website
- All verification checks pass

## Checklist
- [ ] Updated SKILL.md (if needed)
- [ ] Updated reference files (if needed)
- [ ] Updated CHANGELOG.md
- [ ] Incremented version (if breaking change)
- [ ] All tests pass
- [ ] Documentation is clear
- [ ] No sensitive data included

## Screenshots/Examples
If applicable, add screenshots or example output
```

### Review Process

1. **Automated checks**: Linting, file validation
2. **Manual review**: Code quality, documentation clarity
3. **Testing**: Reviewer tests the changes
4. **Approval**: Maintainer approves and merges

### After Merge

1. Version tag is created (if version changed)
2. CHANGELOG is updated with release date
3. Announcement (for major features)

---

## Development Tips

### Progressive Disclosure

Keep SKILL.md concise:
- Overview and quick start: Always in SKILL.md
- Detailed workflows: Link to references/
- Edge cases: Link to TROUBLESHOOTING.md
- Common patterns: Link to RECIPES.md

**Example**:
```markdown
## Visual Integration

Brief overview here (3-4 lines)

See [Visual Integration Guide](references/VISUAL_INTEGRATION.md) for complete workflow.
```

### Token Optimization

Current token usage:
- SKILL.md: ~6,400 tokens (loaded on every invocation)
- Reference files: Loaded only when needed

Goal: Keep SKILL.md under 8,000 tokens

### Testing Quick Reference

```bash
# Verify prerequisites
node scripts/verify-setup.js

# Test with API key format check
node scripts/verify-setup.js --check-api-key sk-ant-api03-...

# Link to Claude skills directory
ln -s $(pwd) ~/.claude/skills/char-setup-dev

# Test in Claude Code
# Ask: "Use the char-setup-dev skill to create a demo page"
```

---

## Questions?

- **Feature requests**: Open an issue with "Feature:" prefix
- **Bug reports**: Open an issue with "Bug:" prefix
- **General questions**: Open a discussion
- **Security issues**: Email alex@mcp-b.ai (do not open public issue)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing! 🎉
