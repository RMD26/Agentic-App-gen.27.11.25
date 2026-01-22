
import { Agent, File, ExecutionStep } from './types';

export const INITIAL_AGENTS: Agent[] = [
    { id: '1', name: 'Atlas', role: 'planner', status: 'idle', message: 'Product Manager - Ready to define features', phase: 'planning' },
    { id: '2', name: 'Aesthete', role: 'designer', status: 'idle', message: 'Visual Designer - Ready to create theme.json', phase: 'designing' },
    { id: '3', name: 'Nexus', role: 'architect', status: 'idle', message: 'Software Architect - Ready to scaffold structure', phase: 'architecting' },
    { id: '4', name: 'Spark', role: 'coder', status: 'idle', message: 'Full-Stack Engineer - Ready to implement', phase: 'coding' },
    { id: '5', name: 'Patcher', role: 'healer', status: 'idle', message: 'Self-Healing Agent - Ready for surgical repairs', phase: 'healing' },
];

export const INITIAL_STEPS: ExecutionStep[] = [
    { id: 1, label: 'Plan Features & Data', status: 'pending', phase: 'planning' },
    { id: 2, label: 'Design Theme System', status: 'pending', phase: 'designing' },
    { id: 3, label: 'Scaffold Architecture', status: 'pending', phase: 'architecting' },
    { id: 4, label: 'Generate Core Files', status: 'pending', phase: 'coding' },
    { id: 5, label: 'Implement Features', status: 'pending', phase: 'coding' },
    { id: 6, label: 'Verify & Finalize', status: 'pending', phase: 'ready' },
];

// Layout sizing constants (px unless noted).
export const LAYOUT_CONSTANTS = {
    sidebarWidth: 320,
    terminalHeight: 192,
    previewWidthPercent: 45,
    geminiLabHeight: 320,
    geminiAssistantWidth: 320,
    geminiAssistantMinWidth: 240,
    geminiAssistantMaxWidth: 520,
    agentSwarmHeight: 256,
    geminiLabMinHeight: 180,
    resizeStep: 16
};


// Enhanced Agent System Prompts for State Machine Architecture
export const AGENT_SYSTEM_PROMPTS = {
    PLANNER: `You are Atlas, the Product Manager and Planning Agent.
Your goal: Convert user intent into concrete engineering specifications.

CRITICAL RULES:
1. Define a clear, prioritized feature list
2. Design a data schema for src/lib/mockData.ts with 50+ realistic entries
3. Specify complete file structure
4. DO NOT write code yet - only planning

THE MOCK DATA MANDATE:
You MUST plan for realistic mock data. Examples:
✓ GOOD: "Alice Johnson, VP of Sales, alice.j@company.com"
✗ BAD: "User 1, user1@example.com"

Output JSON format:
{
  "features": ["User authentication", "Task management", "Real-time updates"],
  "fileStructure": ["src/app/page.tsx", "src/lib/mockData.ts", "src/components/TaskList.tsx"],
  "mockDataSchema": {
    "users": "Array of 50+ users with realistic names, titles, emails, avatars",
    "tasks": "Array of 100+ tasks with varied statuses, priorities, assignees"
  }
}`,

    DESIGNER: `You are Aesthete, the Visual Designer Agent.
Your goal: Create a theme.json design system with strict Tailwind CSS tokens.

Input: User's aesthetic preference (e.g., "Cyberpunk", "Minimal", "Glassmorphism")

TRANSLATION GUIDE:
- "Cyberpunk" → primary: "cyan-400", accent: "pink-500", bg: "slate-900", radius: "rounded-none", font: "font-mono"
- "Minimal" → primary: "gray-900", accent: "gray-600", bg: "white", radius: "rounded-sm", font: "font-sans"
- "Glassmorphism" → primary: "purple-500", accent: "blue-400", bg: "slate-900", radius: "rounded-2xl", font: "font-sans"

Output JSON format:
{
  "colors": {
    "primary": "cyan-400",
    "secondary": "purple-500",
    "background": "slate-900",
    "surface": "slate-800",
    "text": "cyan-50",
    "accent": "pink-500"
  },
  "radius": "rounded-none",
  "font": "font-mono",
  "spacing": "tight"
}`,

    ARCHITECT: `You are Nexus, the Software Architect Agent.
Your goal: Scaffold the Virtual File System (VFS) with correct structure.

CRITICAL RULES:
1. Ensure src/app/page.tsx is the Next.js 14 App Router entry point
2. Use correct import paths: @/components/..., @/lib/...
3. Create directory structure matching the plan
4. Generate stub/skeleton files (NO full implementation yet)
5. MUST include src/lib/mockData.ts in the structure

HYBRID LAYOUT ARCHITECTURAL CONSTRAINT:
The application MUST use a three-panel hybrid layout:
- Left Panel: Neural Pipeline (agent status, workflow)
- Center Panel: Code Surface (tabbed editor with Code/Preview/Tests)
- Right Panel: Neural Logs (execution logs, terminal output)

The layout MUST preserve:
- Collapsible panels
- Resizable panels (desktop)
- Drag-to-reorder panels
- Theme support (dark/light)
- Mobile stacking behavior

DO NOT change panel IDs, titles, or core structure.

Output: File tree with paths and minimal stub content
Example:
{
  "src/app/page.tsx": "export default function Page() { return <div>Home</div>; }",
  "src/lib/mockData.ts": "export const users = [];",
  "src/components/Header.tsx": "export function Header() { return <header></header>; }"
}`,

    CODER: `You are Spark, the Full-Stack Engineer Agent.
Your goal: Implement the complete application with production-quality code.

CRITICAL RULES:
1. Use Next.js 14 App Router exclusively
2. Inject theme.json values into Tailwind classes (e.g., bg-{theme.colors.background})
3. NO placeholders like "// rest of code" or "// TODO"
4. MUST create src/lib/mockData.ts with 50+ realistic entries
5. Use Lucide React for all icons
6. Use TypeScript with proper types
7. Make it BEAUTIFUL - modern, responsive, polished UI

HYBRID LAYOUT ARCHITECTURAL CONSTRAINT:
ALWAYS embed the code surface inside the center panel of the three-panel hybrid layout.
The layout structure is IMMUTABLE:
- Left Panel: Neural Pipeline (ID: "pipeline")
- Center Panel: Code Surface with tabs (ID: "code") - Code/Preview/Tests
- Right Panel: Neural Logs (ID: "logs")

You MUST preserve:
- Collapsible panels
- Resizable panels (desktop drag handles)
- Drag-to-reorder panels
- Theme support (dark/light)
- Mobile stacking behavior

NEVER change panel IDs, titles, or structure. The generator must respect this architecture.

THE MOCK DATA MANDATE:
src/lib/mockData.ts MUST contain:
- Realistic names: "Sarah Chen", "Marcus Rodriguez", "Aisha Patel"
- Realistic emails: "sarah.chen@company.com"
- Varied data: different roles, statuses, timestamps
- Minimum 50 entries for main entities

Stack: Next.js 14, Tailwind CSS, TypeScript, Lucide React

Output: Complete, functional files ready to run.`,

    HEALER: `You are Patcher, the Self-Healing Agent.
Your goal: Perform surgical repairs on compilation/runtime errors.

PROCESS:
1. READ the stderr logs carefully
2. IDENTIFY the exact file and line number causing the error
3. ANALYZE the root cause (type error, import issue, syntax error, etc.)
4. MUTATE only the specific lines needed to fix the error
5. DO NOT rewrite entire files unless absolutely necessary
6. INCREMENT healing attempt counter

COMMON FIXES:
- Type errors: Add proper TypeScript types
- Import errors: Fix import paths or add missing imports
- Syntax errors: Correct the specific syntax issue
- Missing dependencies: Note what needs to be installed

Output JSON format:
{
  "file": "src/app/page.tsx",
  "fix": "Fixed version of the file OR minimal diff",
  "explanation": "Brief description of what was fixed"
}`
};

// Legacy prompts for backward compatibility
export const AGENT_PROMPTS = {
    CODER: AGENT_SYSTEM_PROMPTS.CODER,
    ARCHITECT: AGENT_SYSTEM_PROMPTS.ARCHITECT
};

export const DEMO_FILES: File[] = [
    {
        name: 'README.md',
        language: 'markdown',
        content: `# TaskMaster 2.0

## Overview
A high-performance, responsive task management application built with vanilla JavaScript and CSS Grid.

## Features
- ✨ Real-time task addition
- 🗑️ Task deletion with animation
- 🎨 Beautiful glassmorphism UI
- 💾 LocalStorage persistence
- 📱 Fully mobile responsive

## Setup
Simply open index.html in any modern browser. No build step required.`
    },
    {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskMaster Pro</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <div class="background-gradient"></div>
    <div class="app-wrapper">
        <header class="app-header">
            <div class="logo-area">
                <div class="logo-icon">✓</div>
                <h1>TaskMaster</h1>
            </div>
            <div class="status-pill">
                <span id="taskCount">0</span> tasks
            </div>
        </header>

        <main>
            <div class="input-container">
                <input type="text" id="taskInput" placeholder="What needs to be done?" autocomplete="off">
                <button id="addBtn" aria-label="Add Task">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            <ul id="taskList" class="task-list">
                <!-- Tasks injected via JS -->
            </ul>

            <div id="emptyState" class="empty-state">
                <p>All caught up! 🎉</p>
                <span>Add a task to get started</span>
            </div>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>`
    },
    {
        name: 'style.css',
        language: 'css',
        content: `:root {
    --primary: #8b5cf6;
    --primary-hover: #7c3aed;
    --bg-dark: #0f172a;
    --card-bg: rgba(30, 41, 59, 0.7);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --border: rgba(255, 255, 255, 0.1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-main);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.background-gradient {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at top right, #312e81, transparent 40%),
                radial-gradient(circle at bottom left, #4c1d95, transparent 40%);
    z-index: -1;
}

.app-wrapper {
    width: 100%;
    max-width: 420px;
    height: 85vh;
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.logo-area { display: flex; align-items: center; gap: 0.75rem; }
.logo-icon {
    width: 32px; height: 32px;
    background: var(--primary);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: bold;
}
h1 { font-size: 1.25rem; font-weight: 600; }

.status-pill {
    background: rgba(255,255,255,0.05);
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.input-container {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

input {
    flex: 1;
    background: rgba(0,0,0,0.2);
    border: 1px solid var(--border);
    padding: 0.75rem 1rem;
    border-radius: 12px;
    color: white;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;
}
input:focus { border-color: var(--primary); background: rgba(0,0,0,0.3); }

button#addBtn {
    background: var(--primary);
    border: none;
    width: 48px;
    border-radius: 12px;
    color: white;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
}
button#addBtn:hover { background: var(--primary-hover); }

.task-list {
    list-style: none;
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}
.task-list::-webkit-scrollbar { width: 4px; }
.task-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

.task-item {
    display: flex;
    align-items: center;
    padding: 0.8rem;
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
    margin-bottom: 0.75rem;
    border: 1px solid transparent;
    transition: all 0.2s;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.task-item:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-1px); }

@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.checkbox {
    width: 20px; height: 20px;
    border: 2px solid var(--text-muted);
    border-radius: 6px;
    margin-right: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}
.task-item.completed .checkbox {
    background: var(--accent-success);
    border-color: var(--accent-success);
}
.task-item.completed span {
    text-decoration: line-through;
    color: var(--text-muted);
}

.delete-btn {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    opacity: 0;
    transition: all 0.2s;
}
.task-item:hover .delete-btn { opacity: 1; }
.delete-btn:hover { color: #ef4444; }

.empty-state {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    text-align: center;
}
.empty-state p { font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--text-main); }
.empty-state span { font-size: 0.85rem; }
`
    },
    {
        name: 'app.js',
        language: 'javascript',
        content: `const state = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || []
};

const dom = {
    input: document.getElementById('taskInput'),
    addBtn: document.getElementById('addBtn'),
    list: document.getElementById('taskList'),
    empty: document.getElementById('emptyState'),
    count: document.getElementById('taskCount')
};

function save() {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
    render();
}

function createTask(text) {
    return { id: Date.now(), text, completed: false };
}

function addTask() {
    const text = dom.input.value.trim();
    if (!text) return;
    state.tasks.unshift(createTask(text));
    dom.input.value = '';
    save();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        save();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save();
}

function render() {
    dom.list.innerHTML = '';
    dom.count.textContent = state.tasks.length;

    if (state.tasks.length === 0) {
        dom.empty.style.display = 'flex';
    } else {
        dom.empty.style.display = 'none';
        state.tasks.forEach(task => {
            const el = document.createElement('li');
            el.className = \`task-item \${task.completed ? 'completed' : ''}\`;
            el.innerHTML = \`
                <div class="checkbox" onclick="window.app.toggle(\${task.id})"></div>
                <span>\${task.text}</span>
                <button class="delete-btn" onclick="window.app.del(\${task.id})">×</button>
            \`;
            dom.list.appendChild(el);
        });
    }
}

// Expose methods for inline handlers
window.app = {
    toggle: toggleTask,
    del: deleteTask
};

dom.addBtn.addEventListener('click', addTask);
dom.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

render();`
    }
];
