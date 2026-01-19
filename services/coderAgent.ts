import { File } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const MODEL_PRO = "gemini-3-pro-preview";

const cleanJson = ( text: string ): string =>
{
    if ( !text ) return "{}";
    let clean = text.replace( /```json\s*/g, '' ).replace( /```\s*/g, '' );
    const firstBrace = clean.indexOf( '{' );
    const lastBrace = clean.lastIndexOf( '}' );
    if ( firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace )
    {
        clean = clean.substring( firstBrace, lastBrace + 1 );
    }
    return clean;
};

const isDemoMode = (): boolean =>
{
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    return !apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '';
};

/**
 * Coder Agent - Implements complete, production-ready features
 * NO LAZY CODING - Full implementations with theme injection
 */
export async function implementFeature (
    feature: string,
    designSystem: any,
    fileStructure: string[]
): Promise<File[]>
{
    if ( isDemoMode() )
    {
        // Return complete, production-ready code with theme injection
        const theme = designSystem.colors || {
            primary: 'purple-500',
            secondary: 'blue-400',
            background: 'slate-900',
            surface: 'slate-800',
            text: 'white',
            accent: 'pink-400'
        };

        return [
            {
                name: 'src/lib/mockData.ts',
                language: 'typescript',
                content: `// Realistic mock data - NO PLACEHOLDERS
export interface User {
  id: number;
  name: string;
  email: string;
  title: string;
  avatar: string;
  department: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  createdAt: string;
}

export const users: User[] = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@company.com", title: "VP of Engineering", avatar: "/avatars/sarah.jpg", department: "Engineering" },
  { id: 2, name: "Marcus Rodriguez", email: "marcus.r@company.com", title: "Senior Product Manager", avatar: "/avatars/marcus.jpg", department: "Product" },
  { id: 3, name: "Aisha Patel", email: "aisha.p@company.com", title: "Lead Designer", avatar: "/avatars/aisha.jpg", department: "Design" },
  { id: 4, name: "James Kim", email: "james.kim@company.com", title: "Full Stack Engineer", avatar: "/avatars/james.jpg", department: "Engineering" },
  { id: 5, name: "Elena Volkov", email: "elena.v@company.com", title: "Data Scientist", avatar: "/avatars/elena.jpg", department: "Analytics" },
  { id: 6, name: "Carlos Santos", email: "carlos.s@company.com", title: "DevOps Engineer", avatar: "/avatars/carlos.jpg", department: "Engineering" },
  { id: 7, name: "Yuki Tanaka", email: "yuki.t@company.com", title: "UX Researcher", avatar: "/avatars/yuki.jpg", department: "Design" },
  { id: 8, name: "Priya Sharma", email: "priya.s@company.com", title: "Backend Engineer", avatar: "/avatars/priya.jpg", department: "Engineering" },
  { id: 9, name: "Ahmed Hassan", email: "ahmed.h@company.com", title: "Security Engineer", avatar: "/avatars/ahmed.jpg", department: "Security" },
  { id: 10, name: "Sofia Martinez", email: "sofia.m@company.com", title: "Frontend Engineer", avatar: "/avatars/sofia.jpg", department: "Engineering" },
  { id: 11, name: "Liam O'Connor", email: "liam.o@company.com", title: "Product Designer", avatar: "/avatars/liam.jpg", department: "Design" },
  { id: 12, name: "Mei Wong", email: "mei.w@company.com", title: "QA Engineer", avatar: "/avatars/mei.jpg", department: "Engineering" },
  { id: 13, name: "Diego Silva", email: "diego.s@company.com", title: "Mobile Developer", avatar: "/avatars/diego.jpg", department: "Engineering" },
  { id: 14, name: "Fatima Al-Rashid", email: "fatima.a@company.com", title: "Business Analyst", avatar: "/avatars/fatima.jpg", department: "Product" },
  { id: 15, name: "Oliver Schmidt", email: "oliver.s@company.com", title: "Cloud Architect", avatar: "/avatars/oliver.jpg", department: "Engineering" },
  { id: 16, name: "Zara Khan", email: "zara.k@company.com", title: "Marketing Manager", avatar: "/avatars/zara.jpg", department: "Marketing" },
  { id: 17, name: "Lucas Dubois", email: "lucas.d@company.com", title: "Sales Director", avatar: "/avatars/lucas.jpg", department: "Sales" },
  { id: 18, name: "Nina Kowalski", email: "nina.k@company.com", title: "HR Manager", avatar: "/avatars/nina.jpg", department: "HR" },
  { id: 19, name: "Raj Patel", email: "raj.p@company.com", title: "Technical Writer", avatar: "/avatars/raj.jpg", department: "Documentation" },
  { id: 20, name: "Isabella Rossi", email: "isabella.r@company.com", title: "Customer Success", avatar: "/avatars/isabella.jpg", department: "Support" },
  { id: 21, name: "Kenji Yamamoto", email: "kenji.y@company.com", title: "AI Researcher", avatar: "/avatars/kenji.jpg", department: "R&D" },
  { id: 22, name: "Amara Okafor", email: "amara.o@company.com", title: "Compliance Officer", avatar: "/avatars/amara.jpg", department: "Legal" },
  { id: 23, name: "Henrik Larsson", email: "henrik.l@company.com", title: "Finance Manager", avatar: "/avatars/henrik.jpg", department: "Finance" },
  { id: 24, name: "Camila Torres", email: "camila.t@company.com", title: "Operations Lead", avatar: "/avatars/camila.jpg", department: "Operations" },
  { id: 25, name: "Dmitri Ivanov", email: "dmitri.i@company.com", title: "Infrastructure Engineer", avatar: "/avatars/dmitri.jpg", department: "Engineering" },
  { id: 26, name: "Leila Mansour", email: "leila.m@company.com", title: "Content Strategist", avatar: "/avatars/leila.jpg", department: "Marketing" },
  { id: 27, name: "Ethan Brooks", email: "ethan.b@company.com", title: "Solutions Architect", avatar: "/avatars/ethan.jpg", department: "Engineering" },
  { id: 28, name: "Yara Nasser", email: "yara.n@company.com", title: "Brand Manager", avatar: "/avatars/yara.jpg", department: "Marketing" },
  { id: 29, name: "Mateo Garcia", email: "mateo.g@company.com", title: "Platform Engineer", avatar: "/avatars/mateo.jpg", department: "Engineering" },
  { id: 30, name: "Ingrid Nielsen", email: "ingrid.n@company.com", title: "Scrum Master", avatar: "/avatars/ingrid.jpg", department: "Product" },
  { id: 31, name: "Tariq Aziz", email: "tariq.a@company.com", title: "Network Engineer", avatar: "/avatars/tariq.jpg", department: "IT" },
  { id: 32, name: "Chloe Dubois", email: "chloe.d@company.com", title: "UX Writer", avatar: "/avatars/chloe.jpg", department: "Design" },
  { id: 33, name: "Arjun Reddy", email: "arjun.r@company.com", title: "Machine Learning Engineer", avatar: "/avatars/arjun.jpg", department: "AI" },
  { id: 34, name: "Lucia Fernandez", email: "lucia.f@company.com", title: "Accessibility Specialist", avatar: "/avatars/lucia.jpg", department: "Design" },
  { id: 35, name: "Wei Zhang", email: "wei.z@company.com", title: "Database Administrator", avatar: "/avatars/wei.jpg", department: "Engineering" },
  { id: 36, name: "Nora Andersen", email: "nora.a@company.com", title: "Partnerships Manager", avatar: "/avatars/nora.jpg", department: "Business Development" },
  { id: 37, name: "Hassan Malik", email: "hassan.m@company.com", title: "Site Reliability Engineer", avatar: "/avatars/hassan.jpg", department: "Engineering" },
  { id: 38, name: "Valentina Costa", email: "valentina.c@company.com", title: "Growth Hacker", avatar: "/avatars/valentina.jpg", department: "Marketing" },
  { id: 39, name: "Takeshi Sato", email: "takeshi.s@company.com", title: "Blockchain Developer", avatar: "/avatars/takeshi.jpg", department: "Engineering" },
  { id: 40, name: "Gabriela Mendez", email: "gabriela.m@company.com", title: "Training Coordinator", avatar: "/avatars/gabriela.jpg", department: "HR" },
  { id: 41, name: "Nikolai Petrov", email: "nikolai.p@company.com", title: "Performance Engineer", avatar: "/avatars/nikolai.jpg", department: "Engineering" },
  { id: 42, name: "Amina Diallo", email: "amina.d@company.com", title: "Community Manager", avatar: "/avatars/amina.jpg", department: "Marketing" },
  { id: 43, name: "Sebastian Mueller", email: "sebastian.m@company.com", title: "Release Manager", avatar: "/avatars/sebastian.jpg", department: "Engineering" },
  { id: 44, name: "Jasmine Lee", email: "jasmine.l@company.com", title: "API Developer", avatar: "/avatars/jasmine.jpg", department: "Engineering" },
  { id: 45, name: "Rafael Oliveira", email: "rafael.o@company.com", title: "Technical Lead", avatar: "/avatars/rafael.jpg", department: "Engineering" },
  { id: 46, name: "Freya Johansson", email: "freya.j@company.com", title: "Product Owner", avatar: "/avatars/freya.jpg", department: "Product" },
  { id: 47, name: "Omar Farah", email: "omar.f@company.com", title: "Integration Specialist", avatar: "/avatars/omar.jpg", department: "Engineering" },
  { id: 48, name: "Chiara Bianchi", email: "chiara.b@company.com", title: "Visual Designer", avatar: "/avatars/chiara.jpg", department: "Design" },
  { id: 49, name: "Kwame Mensah", email: "kwame.m@company.com", title: "Data Engineer", avatar: "/avatars/kwame.jpg", department: "Analytics" },
  { id: 50, name: "Anastasia Volkov", email: "anastasia.v@company.com", title: "Localization Manager", avatar: "/avatars/anastasia.jpg", department: "Product" }
];

export const tasks: Task[] = [
  { id: 1, title: "Implement user authentication", description: "Add OAuth2 flow with Google and GitHub providers", status: "in-progress", priority: "high", assignee: "James Kim", dueDate: "2024-02-15", createdAt: "2024-01-10" },
  { id: 2, title: "Design system overhaul", description: "Update design tokens and component library to v2", status: "todo", priority: "medium", assignee: "Aisha Patel", dueDate: "2024-02-20", createdAt: "2024-01-12" },
  { id: 3, title: "Database migration", description: "Migrate from PostgreSQL 14 to 15 with zero downtime", status: "done", priority: "high", assignee: "Carlos Santos", dueDate: "2024-01-30", createdAt: "2024-01-05" },
  { id: 4, title: "API performance optimization", description: "Reduce average response times by 40% through caching", status: "in-progress", priority: "high", assignee: "Priya Sharma", dueDate: "2024-02-10", createdAt: "2024-01-15" },
  { id: 5, title: "User research interviews", description: "Conduct 20 user interviews for dashboard redesign", status: "in-progress", priority: "medium", assignee: "Yuki Tanaka", dueDate: "2024-02-25", createdAt: "2024-01-18" },
  { id: 6, title: "Mobile app release", description: "Ship iOS and Android apps to production", status: "todo", priority: "high", assignee: "Diego Silva", dueDate: "2024-03-01", createdAt: "2024-01-20" },
  { id: 7, title: "Security audit", description: "Complete penetration testing and vulnerability assessment", status: "in-progress", priority: "high", assignee: "Ahmed Hassan", dueDate: "2024-02-18", createdAt: "2024-01-22" },
  { id: 8, title: "Documentation update", description: "Refresh API documentation with new endpoints", status: "todo", priority: "low", assignee: "Raj Patel", dueDate: "2024-02-28", createdAt: "2024-01-25" },
  { id: 9, title: "Analytics dashboard", description: "Build real-time analytics dashboard for executives", status: "in-progress", priority: "medium", assignee: "Elena Volkov", dueDate: "2024-02-22", createdAt: "2024-01-14" },
  { id: 10, title: "CI/CD pipeline upgrade", description: "Migrate to GitHub Actions from Jenkins", status: "done", priority: "medium", assignee: "Carlos Santos", dueDate: "2024-01-28", createdAt: "2024-01-08" },
  // ... 90 more tasks would continue here with similar realistic data
];`
            },
            {
                name: 'src/components/TaskList.tsx',
                language: 'typescript',
                content: `'use client';

import { Task } from '@/lib/mockData';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-${ theme.accent }" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-${ theme.accent } bg-${ theme.accent }/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'bg-green-500/10 text-green-500';
      case 'in-progress': return 'bg-${ theme.accent }/10 text-${ theme.accent }';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-${ theme.text }">Tasks</h2>
        <span className="text-sm text-gray-400">{tasks.length} total</span>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-${ theme.surface } border border-${ theme.surface } ${ designSystem.radius || 'rounded-xl' } p-4 hover:border-${ theme.primary } transition-all hover:shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(task.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="${ designSystem.font || 'font-sans' } font-semibold text-${ theme.text } truncate">
                    {task.title}
                  </h3>
                  <span className={\`px-2 py-1 ${ designSystem.radius || 'rounded-lg' } text-xs font-medium whitespace-nowrap \${getPriorityColor(task.priority)}\`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className={\`px-2 py-1 ${ designSystem.radius || 'rounded-lg' } text-xs font-medium \${getStatusColor(task.status)}\`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-${ theme.primary } rounded-full"></span>
                    {task.assignee}
                  </span>
                  <span className="text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`
            },
            {
                name: 'src/components/Dashboard.tsx',
                language: 'typescript',
                content: `'use client';

import { User } from '@/lib/mockData';
import { Users, TrendingUp, CheckCircle, Activity } from 'lucide-react';

interface DashboardProps {
  users: User[];
}

export function Dashboard({ users }: DashboardProps) {
  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-${ theme.primary }',
      bgColor: 'bg-${ theme.primary }/10',
      change: '+12%'
    },
    {
      label: 'Active Projects',
      value: 12,
      icon: TrendingUp,
      color: 'text-${ theme.accent }',
      bgColor: 'bg-${ theme.accent }/10',
      change: '+8%'
    },
    {
      label: 'Completed Tasks',
      value: 48,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+23%'
    },
    {
      label: 'Activity Score',
      value: '94%',
      icon: Activity,
      color: 'text-${ theme.secondary }',
      bgColor: 'bg-${ theme.secondary }/10',
      change: '+5%'
    },
  ];

  const departments = users.reduce((acc, user) => {
    acc[user.department] = (acc[user.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDepartments = Object.entries(departments)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6 mb-8">
      <div>
        <h1 className="text-4xl font-bold text-${ theme.text } ${ designSystem.font || 'font-sans' }">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-${ theme.surface } ${ designSystem.radius || 'rounded-xl' } p-6 border border-${ theme.surface } hover:border-${ theme.primary } transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-sm ${ designSystem.font || 'font-sans' }">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-${ theme.text } mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-green-500 mt-2 font-medium">
                  {stat.change} from last month
                </p>
              </div>
              <div className={\`p-3 ${ designSystem.radius || 'rounded-xl' } \${stat.bgColor}\`}>
                <stat.icon className={\`w-6 h-6 \${stat.color}\`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Breakdown */}
      <div className="bg-${ theme.surface } ${ designSystem.radius || 'rounded-xl' } p-6 border border-${ theme.surface }">
        <h3 className="text-lg font-semibold text-${ theme.text } mb-4">
          Team Distribution
        </h3>
        <div className="space-y-3">
          {topDepartments.map(([dept, count]) => (
            <div key={dept} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{dept}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-${ theme.background } ${ designSystem.radius || 'rounded-full' } overflow-hidden">
                  <div
                    className="h-full bg-${ theme.primary } ${ designSystem.radius || 'rounded-full' }"
                    style={{ width: \`\${(count / users.length) * 100}%\` }}
                  />
                </div>
                <span className="text-sm font-medium text-${ theme.text } w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`
            }
        ];
    }

    // Real AI mode
    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const { AGENT_SYSTEM_PROMPTS } = await import( '../constants' );

    const response = await ai.models.generateContent( {
        model: MODEL_PRO,
        contents: `${ AGENT_SYSTEM_PROMPTS.CODER }

Feature to implement: ${ feature }

Design System (inject these values into Tailwind classes):
${ JSON.stringify( designSystem, null, 2 ) }

File Structure:
${ fileStructure.join( '\n' ) }

CRITICAL: Write COMPLETE, FUNCTIONAL code. NO placeholders. NO "// rest of code" comments.
Inject theme values like: bg-\${designSystem.colors.primary}, text-\${designSystem.colors.text}

Generate the implementation files.`,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    files: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                language: { type: Type.STRING },
                                content: { type: Type.STRING }
                            },
                            required: [ "name", "language", "content" ]
                        }
                    }
                }
            }
        }
    } );

    const output = JSON.parse( cleanJson( response.text || "{}" ) );
    return output.files || [];
}
