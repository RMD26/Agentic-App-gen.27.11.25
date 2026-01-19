
import { GoogleGenAI, Type } from "@google/genai";
import { File, ClarificationRequest, ProjectConfig, AspectRatio, ImageSize } from '../types';
import { demoService } from './demoService';

// Constants for Gemini 3 Models
const MODEL_FLASH = "gemini-3-flash-preview";
const MODEL_PRO = "gemini-3-pro-preview";
const MODEL_IMAGE = "gemini-3-pro-image-preview";

// Check if we're in demo mode (no API key or placeholder key)
const isDemoMode = (): boolean =>
{
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  return !apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '';
};

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

export const aiService = {


  // Chatbot with Thinking and Image Analysis capabilities
  chat: async ( message: string, history: any[], attachment?: string, useThinking?: boolean ) =>
  {
    // Use demo mode if no API key
    if ( isDemoMode() )
    {
      return demoService.chat( message );
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );

    const parts: any[] = [ { text: message } ];

    // Add image understanding if attachment provided
    if ( attachment )
    {
      // Extract mime type and base64 data correctly
      const matches = attachment.match( /^data:(.+);base64,(.+)$/ );
      if ( matches && matches.length === 3 )
      {
        parts.push( {
          inlineData: {
            mimeType: matches[ 1 ],
            data: matches[ 2 ]
          }
        } );
      }
    }

    const config: any = {};
    if ( useThinking )
    {
      // Set maximum thinking budget for Pro as per instructions
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent( {
      model: MODEL_PRO,
      contents: [ ...history, { role: 'user', parts } ],
      config
    } );

    return response.text;
  },

  // Advanced Image Generation
  generateImage: async ( prompt: string, aspectRatio: AspectRatio = "1:1", imageSize: ImageSize = "1K" ): Promise<string> =>
  {
    // Use demo mode if no API key
    if ( isDemoMode() )
    {
      return demoService.generateImage( prompt );
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const response = await ai.models.generateContent( {
      model: MODEL_IMAGE,
      contents: [ { text: prompt } ],
      config: {
        imageConfig: {
          aspectRatio,
          imageSize
        }
      }
    } );

    // Find image part in candidates
    const part = response.candidates[ 0 ].content.parts.find( p => p.inlineData );
    return part ? `data:image/png;base64,${ part.inlineData.data }` : "";
  },

  generateStep: async ( stepId: number, context: any ): Promise<any> =>
  {
    // Use demo mode if no API key
    if ( isDemoMode() )
    {
      return demoService.generateStep( stepId, context );
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const { config, currentFiles, clarificationAnswer } = context;

    const fileContext = currentFiles
      ? `Current Project Files:\n${ currentFiles.map( ( f: any ) => `--- ${ f.name } ---\n${ f.content }` ).join( '\n\n' ) }`
      : "";

    // Use Flash for standard fast generation steps
    const response = await ai.models.generateContent( {
      model: MODEL_FLASH,
      contents: `Project: ${ config.name }. Step: ${ stepId }. ${ fileContext }`,
      config: {
        systemInstruction: "Expert AI agent assistant. Output project files in JSON.",
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
                  content: { type: Type.STRING },
                },
                required: [ "name", "language", "content" ]
              }
            }
          }
        }
      }
    } );

    return JSON.parse( cleanJson( response.text || "{}" ) );
  },

  getClarificationAnswer: async ( request: ClarificationRequest, config: ProjectConfig ): Promise<string> =>
  {
    // Use demo mode if no API key
    if ( isDemoMode() )
    {
      return demoService.getClarificationAnswer( request, config );
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const response = await ai.models.generateContent( {
      model: MODEL_FLASH,
      contents: `Architect Nexus: Resolve this ambiguity for ${ config.name }: "${ request.question }"`,
    } );
    return response.text || "Proceed with standard best practices.";
  },

  refineCode: async ( currentFiles: File[], instruction: string, config: ProjectConfig ): Promise<File[]> =>
  {
    // Use demo mode if no API key
    if ( isDemoMode() )
    {
      return demoService.refineCode( currentFiles, instruction, config );
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const fileContext = currentFiles.map( f => `--- ${ f.name } ---\n${ f.content }` ).join( '\n\n' );

    // Use Pro for complex refinement tasks
    const response = await ai.models.generateContent( {
      model: MODEL_PRO,
      contents: `Refine this code. Project: ${ config.name }. Instruction: "${ instruction }". Files:\n${ fileContext }`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // High quality reasoning for edits
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
  },

  // ========== PHASE-SPECIFIC METHODS ==========

  // Phase 1: Planning - Generate project plan
  generatePlan: async ( config: ProjectConfig ): Promise<any> =>
  {
    if ( isDemoMode() )
    {
      return {
        features: [ 'Task Management', 'User Dashboard', 'Real-time Notifications', 'Analytics' ],
        fileStructure: [
          'src/app/page.tsx',
          'src/app/layout.tsx',
          'src/lib/mockData.ts',
          'src/components/TaskList.tsx',
          'src/components/Dashboard.tsx',
          'src/components/Header.tsx'
        ],
        mockDataSchema: {
          users: '50+ users with realistic names (Sarah Chen, Marcus Rodriguez, etc.), titles, emails, avatars',
          tasks: '100+ tasks with varied statuses, priorities, due dates, assignees',
          notifications: '30+ notifications with timestamps and types'
        }
      };
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const { AGENT_SYSTEM_PROMPTS } = await import( '../constants' );

    const response = await ai.models.generateContent( {
      model: MODEL_PRO,
      contents: `${ AGENT_SYSTEM_PROMPTS.PLANNER }\n\nProject Name: ${ config.name }\nDescription: ${ config.description }\nFeatures: ${ config.features.join( ', ' ) }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            fileStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
            mockDataSchema: { type: Type.OBJECT }
          }
        }
      }
    } );

    return JSON.parse( cleanJson( response.text || "{}" ) );
  },

  // Phase 2: Design - Generate theme.json design system
  generateDesignSystem: async ( theme: string ): Promise<any> =>
  {
    if ( isDemoMode() )
    {
      // Return design based on theme
      const themes: Record<string, any> = {
        'cyberpunk': {
          colors: {
            primary: 'cyan-400',
            secondary: 'purple-500',
            background: 'slate-900',
            surface: 'slate-800',
            text: 'cyan-50',
            accent: 'pink-500'
          },
          radius: 'rounded-none',
          font: 'font-mono',
          spacing: 'tight'
        },
        'glassmorphism': {
          colors: {
            primary: 'purple-500',
            secondary: 'blue-400',
            background: 'slate-900',
            surface: 'slate-800/50',
            text: 'white',
            accent: 'pink-400'
          },
          radius: 'rounded-2xl',
          font: 'font-sans',
          spacing: 'relaxed'
        },
        'minimal': {
          colors: {
            primary: 'gray-900',
            secondary: 'gray-600',
            background: 'white',
            surface: 'gray-50',
            text: 'gray-900',
            accent: 'blue-600'
          },
          radius: 'rounded-sm',
          font: 'font-sans',
          spacing: 'normal'
        }
      };

      return themes[ theme.toLowerCase() ] || themes[ 'minimal' ];
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const { AGENT_SYSTEM_PROMPTS } = await import( '../constants' );

    const response = await ai.models.generateContent( {
      model: MODEL_FLASH,
      contents: `${ AGENT_SYSTEM_PROMPTS.DESIGNER }\n\nUser's aesthetic preference: "${ theme }"\n\nCreate a theme.json design system.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                background: { type: Type.STRING },
                surface: { type: Type.STRING },
                text: { type: Type.STRING },
                accent: { type: Type.STRING }
              }
            },
            radius: { type: Type.STRING },
            font: { type: Type.STRING },
            spacing: { type: Type.STRING }
          }
        }
      }
    } );

    return JSON.parse( cleanJson( response.text || "{}" ) );
  },

  // Phase 3: Architecture - Scaffold file system
  scaffoldFileSystem: async ( plan: any ): Promise<Record<string, string>> =>
  {
    if ( isDemoMode() )
    {
      return {
        'src/app/page.tsx': `import { TaskList } from '@/components/TaskList';
import { Dashboard } from '@/components/Dashboard';
import { tasks, users } from '@/lib/mockData';

export default function Page() {
  return (
    <main className="min-h-screen p-8">
      <Dashboard users={users} />
      <TaskList tasks={tasks} />
    </main>
  );
}`,
        'src/app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Task Manager Pro',
  description: 'Manage your tasks efficiently',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
        'src/lib/mockData.ts': `// Mock data will be populated by Coder agent
export const users: any[] = [];
export const tasks: any[] = [];`,
        'src/components/TaskList.tsx': `// Component stub - will be implemented by Coder
export function TaskList({ tasks }: { tasks: any[] }) {
  return <div>TaskList</div>;
}`,
        'src/components/Dashboard.tsx': `// Component stub - will be implemented by Coder
export function Dashboard({ users }: { users: any[] }) {
  return <div>Dashboard</div>;
}`
      };
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const { AGENT_SYSTEM_PROMPTS } = await import( '../constants' );

    const response = await ai.models.generateContent( {
      model: MODEL_FLASH,
      contents: `${ AGENT_SYSTEM_PROMPTS.ARCHITECT }\n\nPlan:\n${ JSON.stringify( plan, null, 2 ) }\n\nScaffold the file system with stub files.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          additionalProperties: { type: Type.STRING }
        }
      }
    } );

    return JSON.parse( cleanJson( response.text || "{}" ) );
  },

  // Phase 5: Healing - Fix errors
  healError: async ( stderr: string, fileSystem: Record<string, string> ): Promise<{ file: string; content: string; explanation: string }> =>
  {
    if ( isDemoMode() )
    {
      return {
        file: 'src/app/page.tsx',
        content: '// Fixed version with proper types',
        explanation: 'Added missing TypeScript types and fixed import paths'
      };
    }

    const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );
    const { AGENT_SYSTEM_PROMPTS } = await import( '../constants' );

    const response = await ai.models.generateContent( {
      model: MODEL_PRO,
      contents: `${ AGENT_SYSTEM_PROMPTS.HEALER }\n\nError Logs:\n${ stderr }\n\nFile System:\n${ JSON.stringify( fileSystem, null, 2 ) }\n\nFix the error.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            file: { type: Type.STRING },
            content: { type: Type.STRING },
            explanation: { type: Type.STRING }
          }
        }
      }
    } );

    return JSON.parse( cleanJson( response.text || "{}" ) );
  }
};
