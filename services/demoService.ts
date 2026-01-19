import { File, ClarificationRequest, ProjectConfig } from '../types';

// Sample project files for demo mode
export const DEMO_FILES: File[] = [
    {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager Pro</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>📋 Task Manager Pro</h1>
            <p class="subtitle">Organize your work efficiently</p>
        </header>

        <div class="add-task-section">
            <input type="text" id="taskInput" placeholder="Add a new task...">
            <button id="addBtn" class="btn-primary">Add Task</button>
        </div>

        <div class="filters">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="active">Active</button>
            <button class="filter-btn" data-filter="completed">Completed</button>
        </div>

        <ul id="taskList" class="task-list"></ul>

        <div class="stats">
            <span id="taskCount">0 tasks remaining</span>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>`
    },
    {
        name: 'style.css',
        language: 'css',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 40px;
    max-width: 600px;
    width: 100%;
}

header {
    text-align: center;
    margin-bottom: 30px;
}

h1 {
    color: #667eea;
    font-size: 2.5rem;
    margin-bottom: 10px;
}

.subtitle {
    color: #666;
    font-size: 1rem;
}

.add-task-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

#taskInput {
    flex: 1;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

#taskInput:focus {
    outline: none;
    border-color: #667eea;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
}

.filter-btn {
    padding: 10px 20px;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
}

.task-list {
    list-style: none;
    margin-bottom: 20px;
}

.task-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s;
}

.task-item:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
    opacity: 0.6;
}

.task-item.completed .task-text {
    text-decoration: line-through;
}

.task-checkbox {
    width: 24px;
    height: 24px;
    cursor: pointer;
}

.task-text {
    flex: 1;
    font-size: 1rem;
}

.delete-btn {
    background: #ff4757;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.delete-btn:hover {
    background: #ff3838;
}

.stats {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    padding-top: 20px;
    border-top: 2px solid #e0e0e0;
}`
    },
    {
        name: 'app.js',
        language: 'javascript',
        content: `let tasks = [];
let filter = 'all';

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// Add task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const task = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(task);
    taskInput.value = '';
    renderTasks();
}

// Toggle task completion
function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    renderTasks();
}

// Delete task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

// Filter tasks
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filter = btn.dataset.filter;
        renderTasks();
    });
});

// Render tasks
function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    taskList.innerHTML = filteredTasks.map(task => \`
        <li class="task-item \${task.completed ? 'completed' : ''}">
            <input
                type="checkbox"
                class="task-checkbox"
                \${task.completed ? 'checked' : ''}
                onchange="toggleTask(\${task.id})"
            >
            <span class="task-text">\${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(\${task.id})">Delete</button>
        </li>
    \`).join('');

    const remaining = tasks.filter(t => !t.completed).length;
    taskCount.textContent = \`\${remaining} task\${remaining !== 1 ? 's' : ''} remaining\`;
}

// Initialize with sample tasks
tasks = [
    { id: 1, text: 'Complete project documentation', completed: false },
    { id: 2, text: 'Review pull requests', completed: true },
    { id: 3, text: 'Update dependencies', completed: false }
];

renderTasks();`
    }
];

// Mock chat responses
export const DEMO_CHAT_RESPONSES = [
    "I can help you with that! This application uses a multi-agent architecture where specialized AI agents work together to generate complete web applications.",
    "The code you're seeing was generated by our agent swarm. Each agent has a specific role - from planning the architecture to writing the actual code.",
    "Great question! The application supports multiple frameworks and can generate HTML/CSS/JS, React, or even full Next.js applications.",
    "I'm analyzing your request... The design uses modern CSS with gradients and smooth transitions for a premium feel.",
    "The mock data ensures your application looks 'alive' from the start, with realistic sample content instead of empty placeholders."
];

// Mock image generation
export const DEMO_IMAGES = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjdlZWE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzY0YmEyO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn46oIERlbW88L3RleHQ+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmMDkzZmI7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNlYzc4O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5qAIEFzc2V0PC90ZXh0Pjwvc3ZnPg=='
];

export const demoService = {
    // Simulate chat with delay
    chat: async ( message: string ): Promise<string> =>
    {
        await new Promise( resolve => setTimeout( resolve, 1000 + Math.random() * 1000 ) );
        const responses = DEMO_CHAT_RESPONSES;
        return responses[ Math.floor( Math.random() * responses.length ) ];
    },

    // Simulate image generation
    generateImage: async ( prompt: string ): Promise<string> =>
    {
        await new Promise( resolve => setTimeout( resolve, 2000 ) );
        return DEMO_IMAGES[ Math.floor( Math.random() * DEMO_IMAGES.length ) ];
    },

    // Simulate step generation
    generateStep: async ( stepId: number, context: any ): Promise<any> =>
    {
        await new Promise( resolve => setTimeout( resolve, 1500 + Math.random() * 1000 ) );

        // Return different files based on step
        if ( stepId === 1 )
        {
            return { files: [ DEMO_FILES[ 0 ] ] };
        } else if ( stepId === 2 )
        {
            return { files: [ DEMO_FILES[ 1 ] ] };
        } else if ( stepId === 3 )
        {
            return { files: [ DEMO_FILES[ 2 ] ] };
        }

        return { files: [] };
    },

    // Simulate clarification
    getClarificationAnswer: async ( request: ClarificationRequest, config: ProjectConfig ): Promise<string> =>
    {
        await new Promise( resolve => setTimeout( resolve, 800 ) );
        return "Proceeding with modern best practices and responsive design.";
    },

    // Simulate code refinement
    refineCode: async ( currentFiles: File[], instruction: string, config: ProjectConfig ): Promise<File[]> =>
    {
        await new Promise( resolve => setTimeout( resolve, 2000 ) );

        // Return slightly modified files
        return currentFiles.map( file => ( {
            ...file,
            content: file.content + '\n// Refined by AI'
        } ) );
    }
};
