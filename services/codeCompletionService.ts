import { GoogleGenAI } from "@google/genai";

const MODEL_FLASH = "gemini-3-flash-preview";

const isDemoMode = (): boolean =>
{
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    return !apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '';
};

export interface CodeCompletionRequest
{
    code: string;
    cursorPosition: number;
    language: string;
    fileName?: string;
}

export interface CodeCompletionSuggestion
{
    text: string;
    displayText: string;
    type: 'completion' | 'snippet' | 'function';
}

/**
 * Gemini-powered code completion service
 * Alternative to GitHub Copilot for web-based editors
 */
export const codeCompletionService = {
    /**
     * Get AI-powered code completions
     */
    async getCompletions ( request: CodeCompletionRequest ): Promise<CodeCompletionSuggestion[]>
    {
        if ( isDemoMode() )
        {
            // Demo mode: return smart suggestions based on context
            return this.getDemoCompletions( request );
        }

        try
        {
            const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );

            const { code, cursorPosition, language } = request;
            const beforeCursor = code.substring( 0, cursorPosition );
            const afterCursor = code.substring( cursorPosition );

            const prompt = `You are an expert code completion assistant. Provide intelligent code suggestions.

Language: ${ language }
Code before cursor:
\`\`\`${ language }
${ beforeCursor }
\`\`\`

Code after cursor:
\`\`\`${ language }
${ afterCursor }
\`\`\`

Provide 3-5 relevant code completions that would make sense at the cursor position.
Focus on:
- Completing the current statement
- Suggesting common patterns
- Context-aware variable/function names
- Proper syntax for ${ language }

Return ONLY valid JSON array of suggestions:
[
  { "text": "completion code", "displayText": "brief description", "type": "completion" }
]`;

            const response = await ai.models.generateContent( {
                model: MODEL_FLASH,
                contents: prompt,
                config: {
                    temperature: 0.3, // Lower temperature for more predictable completions
                    maxOutputTokens: 500
                }
            } );

            const text = response.text || '[]';
            const jsonMatch = text.match( /\[[\s\S]*\]/ );
            if ( jsonMatch )
            {
                return JSON.parse( jsonMatch[ 0 ] );
            }

            return [];
        } catch ( error )
        {
            console.error( 'Code completion error:', error );
            return this.getDemoCompletions( request );
        }
    },

    /**
     * Demo mode completions - smart suggestions without API
     */
    getDemoCompletions ( request: CodeCompletionRequest ): CodeCompletionSuggestion[]
    {
        const { code, cursorPosition, language } = request;
        const beforeCursor = code.substring( 0, cursorPosition );
        const lastLine = beforeCursor.split( '\n' ).pop() || '';

        const suggestions: CodeCompletionSuggestion[] = [];

        // JavaScript/TypeScript completions
        if ( language === 'javascript' || language === 'typescript' )
        {
            if ( lastLine.includes( 'const ' ) || lastLine.includes( 'let ' ) || lastLine.includes( 'var ' ) )
            {
                suggestions.push(
                    { text: ' = ', displayText: 'Initialize variable', type: 'completion' },
                    { text: ' = []', displayText: 'Initialize as array', type: 'snippet' },
                    { text: ' = {}', displayText: 'Initialize as object', type: 'snippet' }
                );
            }

            if ( lastLine.includes( 'function ' ) )
            {
                suggestions.push(
                    { text: '() {\n  \n}', displayText: 'Function body', type: 'snippet' },
                    { text: '(params) {\n  return \n}', displayText: 'Function with return', type: 'snippet' }
                );
            }

            if ( lastLine.trim().endsWith( '.' ) )
            {
                suggestions.push(
                    { text: 'map()', displayText: 'Array map', type: 'function' },
                    { text: 'filter()', displayText: 'Array filter', type: 'function' },
                    { text: 'forEach()', displayText: 'Array forEach', type: 'function' },
                    { text: 'length', displayText: 'Length property', type: 'completion' }
                );
            }

            if ( lastLine.includes( 'console.' ) )
            {
                suggestions.push(
                    { text: 'log()', displayText: 'Console log', type: 'function' },
                    { text: 'error()', displayText: 'Console error', type: 'function' },
                    { text: 'warn()', displayText: 'Console warn', type: 'function' }
                );
            }
        }

        // HTML completions
        if ( language === 'html' )
        {
            if ( lastLine.includes( '<' ) )
            {
                suggestions.push(
                    { text: 'div></div>', displayText: 'Div element', type: 'snippet' },
                    { text: 'button></button>', displayText: 'Button element', type: 'snippet' },
                    { text: 'input type="text" />', displayText: 'Text input', type: 'snippet' }
                );
            }
        }

        // CSS completions
        if ( language === 'css' )
        {
            if ( lastLine.includes( '{' ) )
            {
                suggestions.push(
                    { text: '\n  display: flex;\n', displayText: 'Flexbox layout', type: 'snippet' },
                    { text: '\n  position: relative;\n', displayText: 'Position relative', type: 'snippet' },
                    { text: '\n  margin: 0;\n  padding: 0;\n', displayText: 'Reset spacing', type: 'snippet' }
                );
            }
        }

        // Generic completions
        if ( suggestions.length === 0 )
        {
            suggestions.push(
                { text: '\n', displayText: 'New line', type: 'completion' },
                { text: '  ', displayText: 'Indent', type: 'completion' }
            );
        }

        return suggestions.slice( 0, 5 );
    },

    /**
     * Get inline suggestion (like Copilot ghost text)
     */
    async getInlineSuggestion ( request: CodeCompletionRequest ): Promise<string>
    {
        if ( isDemoMode() )
        {
            return this.getDemoInlineSuggestion( request );
        }

        try
        {
            const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );

            const { code, cursorPosition, language } = request;
            const beforeCursor = code.substring( 0, cursorPosition );

            const prompt = `Complete this ${ language } code naturally. Provide ONLY the completion text, no explanations:

\`\`\`${ language }
${ beforeCursor }`;

            const response = await ai.models.generateContent( {
                model: MODEL_FLASH,
                contents: prompt,
                config: {
                    temperature: 0.2,
                    maxOutputTokens: 100
                }
            } );

            return response.text?.trim() || '';
        } catch ( error )
        {
            return '';
        }
    },

    getDemoInlineSuggestion ( request: CodeCompletionRequest ): string
    {
        const { code, cursorPosition } = request;
        const beforeCursor = code.substring( 0, cursorPosition );
        const lastLine = beforeCursor.split( '\n' ).pop() || '';

        // Simple pattern-based suggestions
        if ( lastLine.includes( 'function ' ) )
        {
            return '() {\n  \n}';
        }
        if ( lastLine.includes( 'const ' ) )
        {
            return ' = ';
        }

        return '';
    }
};
