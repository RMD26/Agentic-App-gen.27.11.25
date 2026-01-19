# Hybrid Layout Architectural Constraint

## Overview

This document defines the **IMMUTABLE** three-panel hybrid layout architecture that all code generators MUST preserve.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    App Header                           │
│  Title · Status · Theme Toggle                          │
└─────────────────────────────────────────────────────────┘

┌──────────────┬────────────────────┬──────────────────────┐
│              │                    │                      │
│   NEURAL     │   CODE SURFACE     │   NEURAL LOGS        │
│   PIPELINE   │   (Tabbed)         │                      │
│              │                    │                      │
│  ID: pipeline│   ID: code         │   ID: logs           │
│              │                    │                      │
│  Agent       │   ┌──────────────┐ │   [KERNEL] ...       │
│  Status      │   │Code│Preview│  │   [TELEMETRY] ...    │
│  Cards       │   └──────────────┘ │   [MODE] ...         │
│              │                    │                      │
│  Workflow    │   <CodeEditor />   │   Terminal           │
│  Progress    │                    │   Output             │
│              │                    │                      │
└──────────────┴────────────────────┴──────────────────────┘
       ↕              ↕                    ↕
   Resizable      Resizable            Resizable
   Collapsible    Collapsible          Collapsible
   Draggable      Draggable            Draggable
```

---

## Panel Specifications

### Left Panel: Neural Pipeline

- **ID**: `"pipeline"`
- **Title**: `"Neural Pipeline"`
- **Purpose**: Agent status, workflow visualization
- **Content**:
  - Agent status cards (Atlas, Aesthete, Nexus, Spark, Patcher)
  - Current phase indicator
  - Execution progress
  - Workflow state

### Center Panel: Code Surface

- **ID**: `"code"`
- **Title**: `"Code Surface"`
- **Purpose**: Code editing with tabbed interface
- **Tabs**:
  1. **Code** - File editor with AI completion
  2. **Preview** - Live preview iframe
  3. **Tests** - Test results and coverage
- **Content**: Monaco/CodeEditor component

### Right Panel: Neural Logs

- **ID**: `"logs"`
- **Title**: `"Neural Logs"`
- **Purpose**: Execution logs and terminal output
- **Content**:
  - Real-time log streaming
  - Error messages
  - Agent communications
  - Terminal output

---

## Required Features

### 1. Collapsible Panels ✅

- Each panel header has a collapse/expand button
- Clicking header toggles panel body visibility
- Collapsed panels show only header
- Smooth CSS transitions

### 2. Resizable Panels ✅

- Desktop: Drag handles between panels
- Adjust panel width dynamically
- Maintain proportions
- Mobile: No resize (stacked layout)

### 3. Drag-to-Reorder ✅

- Panels can be reordered via drag-and-drop
- Maintain panel IDs and content
- Visual feedback during drag
- Persist order to localStorage

### 4. Theme Support ✅

- Dark mode (default)
- Light mode
- Smooth theme transitions
- Consistent color palette

### 5. Mobile Stacking ✅

- Panels stack vertically on mobile
- No resize handles on mobile
- Collapse/expand still works
- Responsive breakpoint: 768px

---

## Immutable Constraints

### ❌ NEVER Change

1. **Panel IDs**:
   - `pipeline`
   - `code`
   - `logs`

2. **Panel Titles**:
   - "Neural Pipeline"
   - "Code Surface"
   - "Neural Logs"

3. **Core Structure**:
   - Three-panel layout
   - Left-Center-Right order (desktop)
   - Tabbed code surface in center

4. **Feature Set**:
   - Collapsible
   - Resizable
   - Draggable
   - Theme toggle

### ✅ CAN Change

1. **Panel Content**: What's displayed inside each panel
2. **Tab Content**: Code/Preview/Tests implementation
3. **Styling**: Colors, spacing (within theme)
4. **Default Widths**: Initial panel proportions
5. **Default Order**: Initial panel arrangement

---

## Agent Responsibilities

### Architect (Nexus)

- Scaffold layout structure
- Ensure three-panel grid
- Include panel components
- Set up routing

### Coder (Spark)

- Implement panel content
- Add agent status to pipeline
- Embed code editor in center
- Stream logs to right panel
- **NEVER** break layout structure

### Designer (Aesthete)

- Theme colors for panels
- Transition animations
- Visual polish
- Maintain contrast

---

## Code Generation Rules

When generating code, agents MUST:

1. **Preserve Layout Structure**

   ```tsx
   <main className="app-main">
     <section className="panel" id="pipeline">...</section>
     <section className="panel" id="code">...</section>
     <section className="panel" id="logs">...</section>
   </main>
   ```

2. **Maintain Tabs in Center Panel**

   ```tsx
   <div className="tabs">
     <button className="tab active">Code</button>
     <button className="tab">Preview</button>
     <button className="tab">Tests</button>
   </div>
   ```

3. **Include Resize Handles**

   ```tsx
   <div className="resize-handle" />
   ```

4. **Support Collapse**

   ```tsx
   <div className="panel-header" onClick={toggleCollapse}>
     <span className="panel-title">{title}</span>
     <span className="collapse-btn">{collapsed ? "+" : "−"}</span>
   </div>
   ```

---

## Validation Checklist

Before deploying generated code, verify:

- [ ] Three panels present (pipeline, code, logs)
- [ ] Panel IDs unchanged
- [ ] Panel titles unchanged
- [ ] Collapsible functionality works
- [ ] Resize handles present (desktop)
- [ ] Drag-to-reorder works
- [ ] Theme toggle works
- [ ] Mobile stacking works
- [ ] Code surface has tabs
- [ ] No layout breaking changes

---

## Error Prevention

### Common Mistakes to Avoid

❌ **Changing panel IDs**

```tsx
// WRONG
<section id="left-panel">
```

✅ **Correct**

```tsx
// RIGHT
<section id="pipeline">
```

❌ **Removing tabs**

```tsx
// WRONG
<div className="panel-body">
  <CodeEditor />
</div>
```

✅ **Correct**

```tsx
// RIGHT
<div className="panel-body">
  <div className="tabs">...</div>
  <CodeEditor />
</div>
```

❌ **Breaking responsive layout**

```tsx
// WRONG
.app-main { display: block; }
```

✅ **Correct**

```tsx
// RIGHT
.app-main { display: grid; grid-template-columns: 1fr 1.4fr 1fr; }
@media (max-width: 768px) { display: flex; flex-direction: column; }
```

---

## Summary

The hybrid layout is a **core architectural constraint** that ensures:

✅ Consistent user experience
✅ Predictable code generation
✅ Maintainable structure
✅ Professional appearance
✅ Responsive design

**All agents MUST respect this architecture.**
