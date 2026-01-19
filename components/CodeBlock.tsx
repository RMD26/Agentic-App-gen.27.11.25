import React, { useState, useRef, useEffect } from 'react';
import { codeCompletionService, CodeCompletionSuggestion } from '../services/codeCompletionService';

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
    const [ suggestions, setSuggestions ] = useState<CodeCompletionSuggestion[]>( [] );
    const [ selectedIndex, setSelectedIndex ] = useState( 0 );
    const [ showSuggestions, setShowSuggestions ] = useState( false );
    const [ isLoadingSuggestions, setIsLoadingSuggestions ] = useState( false );
    const [ inlineSuggestion, setInlineSuggestion ] = useState( '' );
    const textareaRef = useRef<HTMLTextAreaElement>( null );
    const suggestionsRef = useRef<HTMLDivElement>( null );

    // Get AI completions
    const fetchCompletions = async () =>
    {
        if ( !textareaRef.current || readOnly ) return;

        const cursorPosition = textareaRef.current.selectionStart;
        setIsLoadingSuggestions( true );

        try
        {
            const completions = await codeCompletionService.getCompletions( {
                code,
                cursorPosition,
                language,
            } );

            if ( completions.length > 0 )
            {
                setSuggestions( completions );
                setSelectedIndex( 0 );
                setShowSuggestions( true );
            }
        } catch ( error )
        {
            console.error( 'Completion error:', error );
        } finally
        {
            setIsLoadingSuggestions( false );
        }
    };

    // Get inline suggestion (ghost text)
    const fetchInlineSuggestion = async () =>
    {
        if ( !textareaRef.current || readOnly ) return;

        const cursorPosition = textareaRef.current.selectionStart;
        const suggestion = await codeCompletionService.getInlineSuggestion( {
            code,
            cursorPosition,
            language,
        } );

        setInlineSuggestion( suggestion );
    };

    // Handle key events
    const handleKeyDown = ( e: React.KeyboardEvent<HTMLTextAreaElement> ) =>
    {
        // Ctrl+Space to trigger completions
        if ( e.ctrlKey && e.key === ' ' )
        {
            e.preventDefault();
            fetchCompletions();
            return;
        }

        // Tab to accept inline suggestion
        if ( e.key === 'Tab' && inlineSuggestion )
        {
            e.preventDefault();
            if ( onChange && textareaRef.current )
            {
                const cursorPos = textareaRef.current.selectionStart;
                const newCode = code.substring( 0, cursorPos ) + inlineSuggestion + code.substring( cursorPos );
                onChange( newCode );
                setInlineSuggestion( '' );
            }
            return;
        }

        if ( showSuggestions )
        {
            if ( e.key === 'ArrowDown' )
            {
                e.preventDefault();
                setSelectedIndex( ( prev ) => ( prev + 1 ) % suggestions.length );
            } else if ( e.key === 'ArrowUp' )
            {
                e.preventDefault();
                setSelectedIndex( ( prev ) => ( prev - 1 + suggestions.length ) % suggestions.length );
            } else if ( e.key === 'Enter' || e.key === 'Tab' )
            {
                e.preventDefault();
                acceptSuggestion( suggestions[ selectedIndex ] );
            } else if ( e.key === 'Escape' )
            {
                setShowSuggestions( false );
            }
        }
    };

    // Accept a suggestion
    const acceptSuggestion = ( suggestion: CodeCompletionSuggestion ) =>
    {
        if ( !onChange || !textareaRef.current ) return;

        const cursorPos = textareaRef.current.selectionStart;
        const newCode = code.substring( 0, cursorPos ) + suggestion.text + code.substring( cursorPos );
        onChange( newCode );
        setShowSuggestions( false );
        setSuggestions( [] );

        // Set cursor after inserted text
        setTimeout( () =>
        {
            if ( textareaRef.current )
            {
                const newPos = cursorPos + suggestion.text.length;
                textareaRef.current.setSelectionRange( newPos, newPos );
                textareaRef.current.focus();
            }
        }, 0 );
    };

    // Auto-fetch inline suggestion on typing (debounced)
    useEffect( () =>
    {
        if ( readOnly ) return;

        const timer = setTimeout( () =>
        {
            fetchInlineSuggestion();
        }, 500 );

        return () => clearTimeout( timer );
    }, [ code, readOnly ] );

    return (
        <div className="flex flex-col h-full w-full bg-[#1e1e1e] border-slate-800 relative">
            { title && (
                <div className="px-4 py-2 bg-[#252526] text-xs text-slate-400 border-b border-[#3e3e42] flex items-center shrink-0 justify-between">
                    <span>{ title }</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase opacity-50 bg-[#3e3e42] px-1.5 py-0.5 rounded font-mono">{ language }</span>
                        { !readOnly && (
                            <span className="text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded font-mono">
                                ✨ AI Assist
                            </span>
                        ) }
                    </div>
                </div>
            ) }
            <div className="flex-1 relative overflow-hidden group">
                <textarea
                    ref={ textareaRef }
                    value={ code }
                    onChange={ ( e ) =>
                    {
                        onChange && onChange( e.target.value );
                        setInlineSuggestion( '' ); // Clear inline suggestion on manual edit
                    } }
                    onKeyDown={ handleKeyDown }
                    readOnly={ readOnly }
                    spellCheck={ false }
                    placeholder={ readOnly ? "No content" : "// Type your code here... (Ctrl+Space for AI suggestions)" }
                    className={ `w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[13px] leading-6 p-6 outline-none resize-none selection:bg-brand-primary/20 ${ readOnly ? 'cursor-default' : 'cursor-text'
                        }` }
                />

                {/* Inline suggestion (ghost text) */ }
                { !readOnly && inlineSuggestion && (
                    <div className="absolute top-6 left-6 pointer-events-none text-[#d4d4d4]/30 font-mono text-[13px] leading-6 whitespace-pre">
                        { code }
                        <span className="text-gray-500">{ inlineSuggestion }</span>
                    </div>
                ) }

                {/* Completion suggestions dropdown */ }
                { showSuggestions && suggestions.length > 0 && (
                    <div
                        ref={ suggestionsRef }
                        className="absolute bg-[#252526] border border-[#3e3e42] rounded-md shadow-2xl z-50 max-w-md top-[100px] left-[100px]"
                    >
                        { suggestions.map( ( suggestion, index ) => (
                            <div
                                key={ index }
                                className={ `px-3 py-2 cursor-pointer flex items-center gap-2 ${ index === selectedIndex ? 'bg-brand-primary/20 border-l-2 border-brand-primary' : 'hover:bg-[#2a2d2e]'
                                    }` }
                                onClick={ () => acceptSuggestion( suggestion ) }
                            >
                                <div className="flex-1">
                                    <div className="text-xs text-[#d4d4d4] font-mono">{ suggestion.displayText }</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5 font-mono truncate">{ suggestion.text }</div>
                                </div>
                                <span className="text-[9px] text-gray-500 uppercase px-1.5 py-0.5 bg-[#3e3e42] rounded">
                                    { suggestion.type }
                                </span>
                            </div>
                        ) ) }
                        <div className="px-3 py-1.5 bg-[#1e1e1e] border-t border-[#3e3e42] text-[9px] text-gray-500 flex items-center justify-between">
                            <span>↑↓ Navigate • Enter/Tab Accept • Esc Close</span>
                            <span className="text-green-400">✨ Powered by Gemini</span>
                        </div>
                    </div>
                ) }

                { isLoadingSuggestions && (
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-[10px] rounded border border-brand-primary/30 backdrop-blur flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        Getting AI suggestions...
                    </div>
                ) }

                { !readOnly && !showSuggestions && !isLoadingSuggestions && (
                    <div className="absolute bottom-4 right-4 px-2 py-1 bg-slate-800/80 text-slate-400 text-[10px] rounded border border-slate-700 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Press Ctrl+Space for AI completions
                    </div>
                ) }
            </div>
        </div >
    );
};

export const CodeBlock = CodeEditor;