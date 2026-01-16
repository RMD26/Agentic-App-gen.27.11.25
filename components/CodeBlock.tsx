import React from 'react';

interface CodeEditorProps
{
    code: string;
    language: string;
    title?: string;
    onChange?: ( newCode: string ) => void;
    readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ( { code, language, title, onChange, readOnly = false } ) =>
{
    const lines = code.split( '\n' );

    return (
        <div className="flex flex-col h-full w-full bg-[#020617] border-slate-800">
            { title && (
                <div className="px-5 py-3 glass-light text-xs text-sky-400 border-b border-white/5 flex items-center shrink-0 justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold tracking-tight">{ title }</span>
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">{ language }</span>
                </div>
            ) }
            <div className="flex-1 flex overflow-hidden group">
                <div className="w-12 bg-[#020617] border-r border-white/5 flex flex-col items-end pt-6 pr-3 select-none">
                    { lines.map( ( _, i ) => (
                        <div key={ i } className="text-[11px] font-mono text-slate-600 leading-6">
                            { i + 1 }
                        </div>
                    ) ) }
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <textarea
                        value={ code }
                        onChange={ ( e ) => onChange && onChange( e.target.value ) }
                        readOnly={ readOnly }
                        spellCheck={ false }
                        placeholder={ readOnly ? "No content" : "// Type your code here..." }
                        className={ `w-full h-full bg-transparent text-slate-300 font-mono text-[13px] leading-6 p-6 outline-none resize-none selection:bg-sky-500/30 ${ readOnly ? 'cursor-default' : 'cursor-text'
                            }` }
                        style={ {
                            fontFamily: '"JetBrains Mono", "Menlo", "Consolas", monospace',
                        } }
                    />
                    { !readOnly && (
                        <div className="absolute bottom-4 right-4 px-3 py-1.5 glass rounded-lg text-sky-400 text-[10px] uppercase font-black tracking-widest border border-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Live Edit
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export const CodeBlock = CodeEditor;