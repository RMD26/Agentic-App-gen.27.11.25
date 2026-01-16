
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Panel } from './components/Section';
import { CodeEditor } from './components/CodeBlock';
import { AgentCard } from './components/PipelineStage';
import { CreateWizard } from './components/wizard/CreateWizard';
import { RefineModal } from './components/RefineModal';
import { Button } from './components/ui/Button';
import { INITIAL_AGENTS, INITIAL_STEPS } from './constants';
import { aiService } from './services/aiService';
import { zipService } from './services/zipService';
import { Agent, LogEntry, File, ExecutionStep, ProjectConfig, ViewMode } from './types';
import
{
    FileIcon, TerminalIcon,
    CheckCircleIcon, CircleIcon, LoaderIcon,
    DesktopIcon, TabletIcon, MobileIcon,
    GeneratorIcon, MaximizeIcon, MinimizeIcon,
    PlayIcon, AlertTriangleIcon, XIcon
} from './components/Icons';

const App: React.FC = () =>
{
    const [ viewMode, setViewMode ] = useState<ViewMode>( 'dashboard' );
    const [ completed, setCompleted ] = useState( false );

    // Project State
    const [ projectConfig, setProjectConfig ] = useState<ProjectConfig | null>( null );
    const [ agents, setAgents ] = useState<Agent[]>( INITIAL_AGENTS );
    const [ logs, setLogs ] = useState<LogEntry[]>( [] );
    const [ files, setFiles ] = useState<File[]>( [] );
    const [ selectedFile, setSelectedFile ] = useState<File | null>( null );
    const [ steps, setSteps ] = useState<ExecutionStep[]>( INITIAL_STEPS );

    // UI State
    const [ previewMode, setPreviewMode ] = useState<'desktop' | 'tablet' | 'mobile'>( 'desktop' );
    const [ previewWidth, setPreviewWidth ] = useState( 45 );
    const [ isResizing, setIsResizing ] = useState( false );
    const [ isZenMode, setIsZenMode ] = useState( false );
    const [ activeError, setActiveError ] = useState<string | null>( null );

    // Refinement State
    const [ isRefineModalOpen, setIsRefineModalOpen ] = useState( false );
    const [ isRefining, setIsRefining ] = useState( false );

    const logsEndRef = useRef<HTMLDivElement>( null );
    const iframeRef = useRef<HTMLIFrameElement>( null );

    // Auto-scroll logs
    useEffect( () =>
    {
        logsEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
    }, [ logs ] );

    // Handle Resize Logic
    const startResizing = useCallback( () =>
    {
        setIsResizing( true );
    }, [] );

    useEffect( () =>
    {
        if ( !isResizing ) return;
        const handleMouseMove = ( e: MouseEvent ) =>
        {
            const newWidth = ( ( window.innerWidth - e.clientX ) / window.innerWidth ) * 100;
            setPreviewWidth( Math.min( Math.max( newWidth, 20 ), 80 ) );
        };
        const handleMouseUp = () => setIsResizing( false );
        window.addEventListener( 'mousemove', handleMouseMove );
        window.addEventListener( 'mouseup', handleMouseUp );
        return () =>
        {
            window.removeEventListener( 'mousemove', handleMouseMove );
            window.removeEventListener( 'mouseup', handleMouseUp );
        };
    }, [ isResizing ] );

    // Keyboard Shortcuts
    useEffect( () =>
    {
        const handleKeyDown = ( e: KeyboardEvent ) =>
        {
            if ( ( e.metaKey || e.ctrlKey ) && e.shiftKey && e.code === 'KeyZ' )
            {
                e.preventDefault();
                setIsZenMode( prev => !prev );
            }

            if ( e.key === 'Escape' && isZenMode )
            {
                setIsZenMode( false );
            }
        };

        window.addEventListener( 'keydown', handleKeyDown );
        return () => window.removeEventListener( 'keydown', handleKeyDown );
    }, [ isZenMode ] );

    // Listen for errors from the iframe
    useEffect( () =>
    {
        const handleMessage = ( event: MessageEvent ) =>
        {
            if ( event.data && event.data.type === 'iframe_error' )
            {
                addLog( `Runtime Error: ${ event.data.message }`, 'system', 'error' );
                autoFixError( event.data.message );
            }
        };
        window.addEventListener( 'message', handleMessage );
        return () => window.removeEventListener( 'message', handleMessage );
    }, [ files, projectConfig ] ); // Need files and config for auto-fix

    // Update preview when files change
    useEffect( () =>
    {
        if ( files.length > 0 && iframeRef.current )
        {
            const htmlFile = files.find( f => f.name.toLowerCase() === 'index.html' );
            const cssFile = files.find( f => f.name.toLowerCase() === 'style.css' );
            const jsFile = files.find( f => f.name.toLowerCase() === 'app.js' );

            if ( htmlFile )
            {
                let content = htmlFile.content;

                // Inject CSS
                if ( cssFile )
                {
                    if ( content.includes( 'style.css' ) )
                    {
                        content = content.replace( /<link[^>]*href=["']style\.css["'][^>]*>/i, `<style>${ cssFile.content }</style>` );
                    } else
                    {
                        content = content.replace( '</head>', `<style>${ cssFile.content }</style></head>` );
                    }
                }

                // Inject Error Handling & JS
                const errorScript = `
        <script>
            window.onerror = function(msg, url, line, col, error) {
                window.parent.postMessage({ type: 'iframe_error', message: msg }, '*');
            };
            console.error = function(...args) {
                window.parent.postMessage({ type: 'iframe_error', message: args.join(' ') }, '*');
            };
            try { localStorage.getItem('test'); } catch(e) {
                console.warn('LocalStorage unavailable in sandbox, mocking...');
                const store = {};
                window.localStorage = {
                    getItem: (k) => store[k],
                    setItem: (k, v) => store[k] = v,
                    removeItem: (k) => delete store[k],
                    clear: () => {}
                };
            }
        </script>`;

                content = content.replace( '<head>', `<head>${ errorScript }` );

                if ( jsFile )
                {
                    if ( content.includes( 'app.js' ) )
                    {
                        content = content.replace( /<script[^>]*src=["']app\.js["'][^>]*><\/script>/i, `<script>${ jsFile.content }</script>` );
                    } else
                    {
                        content = content.replace( '</body>', `<script>${ jsFile.content }</script></body>` );
                    }
                }

                iframeRef.current.srcdoc = content;
            }
        }
    }, [ files ] );

    const addLog = ( message: string, agentId: string = 'system', type: LogEntry[ 'type' ] = 'info' ) =>
    {
        setLogs( prev => [ ...prev, {
            id: Math.random().toString( 36 ).substr( 2, 9 ),
            timestamp: new Date().toLocaleTimeString( [], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' } ),
            agentId,
            message,
            type
        } ] );
    };

    const showError = ( message: string ) =>
    {
        setActiveError( message );
        addLog( message, 'system', 'error' );
    };

    const updateAgent = ( id: string, updates: Partial<Agent> ) =>
    {
        setAgents( prev => prev.map( a => a.id === id ? { ...a, ...updates } : a ) );
    };

    const updateStep = ( id: number, status: ExecutionStep[ 'status' ] ) =>
    {
        setSteps( prev => prev.map( s => s.id === id ? { ...s, status } : s ) );
    };

    const updateFileContent = ( newContent: string ) =>
    {
        if ( !selectedFile ) return;
        setFiles( prev => prev.map( f => f.name === selectedFile.name ? { ...f, content: newContent } : f ) );
        setSelectedFile( prev => prev ? { ...prev, content: newContent } : null );
    };

    const autoFixError = async ( error: string ) =>
    {
        if ( !projectConfig || !files.length ) return;

        // Avoid concurrent healing
        updateAgent( '6', { status: 'working', message: 'Diagnosing error...' } );
        setActiveError( `Healing: ${ error }` );
        addLog( "Sentinel system triggered. Initiating self-healing protocol...", '6', 'warning' );

        try
        {
            const fixedFiles = await aiService.diagnoseAndFix( files, error, projectConfig );
            if ( fixedFiles.length > 0 )
            {
                const newFiles = [ ...files ];
                fixedFiles.forEach( ff =>
                {
                    const idx = newFiles.findIndex( f => f.name === ff.name );
                    if ( idx !== -1 )
                    {
                        newFiles[ idx ] = ff;
                        addLog( `Patched ${ ff.name }`, '6', 'success' );
                    }
                } );
                setFiles( newFiles );
                if ( selectedFile )
                {
                    const updated = fixedFiles.find( f => f.name === selectedFile.name );
                    if ( updated ) setSelectedFile( updated );
                }
                addLog( "Self-healing complete. System stable.", '6', 'success' );
                setActiveError( null );
            } else
            {
                addLog( "Sentinel failed to generate a fix. Manual intervention required.", '6', 'error' );
                setActiveError( `Unresolved Error: ${ error }` );
            }
        } catch ( e )
        {
            console.error( "Auto-fix error:", e );
            addLog( "Self-healing system encountered a critical failure.", '6', 'error' );
        } finally
        {
            updateAgent( '6', { status: 'idle', message: 'Monitoring...' } );
        }
    };

    const wait = ( ms: number ) => new Promise( resolve => setTimeout( resolve, ms ) );

    const handleProjectCreate = ( config: ProjectConfig ) =>
    {
        setProjectConfig( config );
        setViewMode( 'ide' );
        // Ensure state is set before running workflow
        setTimeout( () => runForgeWorkflow( config ), 0 );
    };

    const handleRefinement = async ( instruction: string ) =>
    {
        if ( !projectConfig || !files.length ) return;

        setIsRefining( true );
        addLog( `Refinement request: "${ instruction }"`, 'system', 'cmd' );
        updateAgent( '4', { status: 'working', message: 'Applying refinements...' } );

        try
        {
            const updatedFiles = await aiService.refineCode( files, instruction, projectConfig );

            if ( updatedFiles.length > 0 )
            {
                // Merge updated files into existing files
                const newFiles = [ ...files ];
                updatedFiles.forEach( uf =>
                {
                    const idx = newFiles.findIndex( f => f.name === uf.name );
                    if ( idx !== -1 )
                    {
                        newFiles[ idx ] = uf;
                        addLog( `Updated ${ uf.name }`, '4', 'success' );
                    } else
                    {
                        newFiles.push( uf );
                        addLog( `Created ${ uf.name }`, '4', 'success' );
                    }
                } );
                setFiles( newFiles );
                // Update selected file if the current one was changed, or select the first changed one
                if ( selectedFile )
                {
                    const updatedSelected = updatedFiles.find( f => f.name === selectedFile.name );
                    if ( updatedSelected ) setSelectedFile( updatedSelected );
                } else
                {
                    setSelectedFile( updatedFiles[ 0 ] );
                }
                addLog( 'Refinement applied successfully.', 'system', 'success' );
            } else
            {
                addLog( 'No changes required or refinement failed.', '4', 'warning' );
            }
        } catch ( e )
        {
            showError( `Refinement error: ${ e instanceof Error ? e.message : String( e ) }` );
        } finally
        {
            updateAgent( '4', { status: 'idle', message: 'Refinement complete.' } );
            setIsRefining( false );
            setIsRefineModalOpen( false );
        }
    };

    const runForgeWorkflow = async ( config: ProjectConfig ) =>
    {
        try
        {
            setCompleted( false );
            setActiveError( null );
            setFiles( [] );
            setLogs( [] );
            setAgents( INITIAL_AGENTS );
            setSteps( INITIAL_STEPS );

            addLog( `Initializing Agent Swarm for project: "${ config.name }"`, 'system', 'cmd' );

            let localFiles: File[] = [];

            // --- Step 1: Requirements ---
            updateStep( 1, 'running' );
            updateAgent( '1', { status: 'working', message: 'Analyzing project scope...' } );

            const res1 = await aiService.generateStep( 1, { config } );
            if ( res1.type === 'code' && res1.files.length > 0 )
            {
                localFiles = [ ...localFiles, ...res1.files ];
                setFiles( prev => [ ...prev, ...res1.files ] );
                setSelectedFile( res1.files[ 0 ] );
                addLog( 'Project structure and documentation generated.', '1', 'success' );
            } else
            {
                showError( 'Failed to generate initial documentation. AI response parsed incorrectly.' );
                updateAgent( '1', { status: 'idle', message: 'Failed.' } );
                return;
            }
            updateAgent( '1', { status: 'done', message: 'Specs complete.' } );
            updateStep( 1, 'completed' );


            // --- Step 2: Architecture ---
            updateStep( 2, 'running' );
            updateAgent( '2', { status: 'working', message: 'Designing architecture...' } );
            await wait( 800 );
            addLog( 'Defining MVC pattern and component hierarchy.', '2' );
            updateAgent( '2', { status: 'done', message: 'Architecture defined.' } );
            updateStep( 2, 'completed' );


            // --- Step 3 & 4: Design & Scaffold ---
            updateStep( 3, 'running' );
            updateStep( 4, 'running' );
            updateAgent( '3', { status: 'working', message: `Implementing ${ config.theme } design system...` } );
            updateAgent( '4', { status: 'working', message: 'Scaffolding DOM...' } );

            // CSS
            const res3 = await aiService.generateStep( 3, { config, currentFiles: localFiles } );
            if ( res3.type === 'code' && res3.files.length > 0 )
            {
                localFiles = [ ...localFiles.filter( f => !res3.files.some( nf => nf.name === f.name ) ), ...res3.files ];
                setFiles( prev =>
                {
                    const others = prev.filter( f => !res3.files.find( nf => nf.name === f.name ) );
                    return [ ...others, ...res3.files ];
                } );
                addLog( 'Stylesheet generated.', '3', 'success' );
                updateAgent( '3', { status: 'done', message: 'Assets ready.' } );
                updateStep( 3, 'completed' );
            } else
            {
                showError( 'Failed to generate styles. AI response parsed incorrectly.' );
                return;
            }

            // HTML
            const res4 = await aiService.generateStep( 4, { config, currentFiles: localFiles } );
            if ( res4.type === 'code' && res4.files.length > 0 )
            {
                localFiles = [ ...localFiles.filter( f => !res4.files.some( nf => nf.name === f.name ) ), ...res4.files ];
                setFiles( prev =>
                {
                    const others = prev.filter( f => !res4.files.find( nf => nf.name === f.name ) );
                    return [ ...others, ...res4.files ];
                } );
                addLog( 'DOM structure generated.', '4', 'success' );
                updateStep( 4, 'completed' );
            } else
            {
                showError( 'Failed to generate DOM. AI response parsed incorrectly.' );
                return;
            }


            // --- Step 5: Logic (The Dynamic Loop) ---
            updateStep( 5, 'running' );
            updateAgent( '4', { status: 'working', message: 'Implementing business logic...' } );

            // Attempt 1
            let logicResult = await aiService.generateStep( 5, { config, hasClarified: false, currentFiles: localFiles } );

            if ( logicResult.type === 'clarification' )
            {
                const req = logicResult.request;
                updateAgent( req.fromAgentId, { status: 'waiting', message: `Asking ${ agents.find( a => a.id === req.toAgentId )?.name }...` } );
                addLog( req.question, req.fromAgentId, 'warning' );

                await wait( 500 );
                updateAgent( req.toAgentId, { status: 'working', message: 'Resolving ambiguity...' } );

                const answer = await aiService.getClarificationAnswer( req, config );
                addLog( answer, req.toAgentId, 'chat' );
                updateAgent( req.toAgentId, { status: 'idle', message: 'Standing by.' } );

                await wait( 500 );
                addLog( 'Clarification received. Resuming implementation.', 'system' );
                updateAgent( req.fromAgentId, { status: 'working', message: 'Coding with new context...' } );

                // Attempt 2 - Pass the answer back to the generation service
                logicResult = await aiService.generateStep( 5, {
                    config,
                    hasClarified: true,
                    currentFiles: localFiles,
                    clarificationAnswer: answer
                } );
            }

            if ( logicResult.type === 'code' && logicResult.files.length > 0 )
            {
                localFiles = [ ...localFiles.filter( f => !logicResult.files.some( nf => nf.name === f.name ) ), ...logicResult.files ];
                setFiles( prev =>
                {
                    const others = prev.filter( f => !logicResult.files.find( nf => nf.name === f.name ) );
                    return [ ...others, ...logicResult.files ];
                } );
                const jsFile = logicResult.files.find( f => f.name.endsWith( '.js' ) );
                if ( jsFile ) setSelectedFile( jsFile );
                addLog( 'Logic implementation complete.', '4', 'success' );
                updateAgent( '4', { status: 'done', message: 'Implementation complete.' } );
                updateStep( 5, 'completed' );
            } else
            {
                showError( 'Logic implementation failed. AI response parsed incorrectly.' );
                return;
            }

            // --- Step 6: QA ---
            updateStep( 6, 'running' );
            updateAgent( '5', { status: 'working', message: 'Running integration tests...' } );
            await wait( 800 );
            addLog( 'All systems verify. Deployment ready.', '5', 'success' );
            updateAgent( '5', { status: 'done', message: 'Verified.' } );
            updateStep( 6, 'completed' );

            setCompleted( true );
        } catch ( error )
        {
            console.error( "Workflow Error:", error );
            showError( `CRITICAL WORKFLOW ERROR: ${ error instanceof Error ? error.message : String( error ) }` );
            setCompleted( false );
        }
    };

    const handleExport = () =>
    {
        if ( projectConfig )
        {
            zipService.downloadProject( files, projectConfig.name );
        }
    };

    const toggleZenMode = () => setIsZenMode( prev => !prev );

    return (
        <div className={ `flex flex-col h-screen bg-brand-background text-brand-text-primary overflow-hidden ${ isResizing ? 'cursor-col-resize select-none' : '' } relative` }>
            {/* Global Error Toast */ }
            { activeError && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-red-500/10 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md flex items-start gap-3">
                        <div className="shrink-0 mt-0.5"><AlertTriangleIcon /></div>
                        <div className="flex-1 text-sm font-medium">{ activeError }</div>
                        <button
                            onClick={ () => setActiveError( null ) }
                            className="shrink-0 text-red-300 hover:text-white transition-colors p-0.5 hover:bg-red-500/20 rounded"
                        >
                            <XIcon />
                        </button>
                    </div>
                </div>
            ) }

            {/* Header hidden in Zen Mode */ }
            { !isZenMode && (
                <Header
                    viewMode={ viewMode }
                    onNavigateHome={ () => setViewMode( 'dashboard' ) }
                    onExport={ handleExport }
                    onRefine={ () => setIsRefineModalOpen( true ) }
                    canExport={ completed && files.length > 0 }
                    canRefine={ completed && files.length > 0 }
                />
            ) }

            { viewMode === 'dashboard' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 relative overflow-hidden">
                    {/* Background ambient effects */ }
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-fast"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px] animate-pulse" style={ { animationDelay: '1s' } }></div>

                    <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-28 h-28 glass rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl relative group overflow-hidden">
                                <div className="absolute inset-0 accent-gradient opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                                <div className="text-white transform scale-[2.5] group-hover:scale-[2.8] transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"><GeneratorIcon /></div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-7xl font-black text-white tracking-tighter leading-none">
                                Agentic Studio <span className="text-sky-500">Pro</span>
                            </h2>
                            <p className="text-brand-text-secondary text-2xl max-w-2xl mx-auto leading-relaxed font-light tracking-tight">
                                The world's first <span className="text-white font-medium">Self-Healing</span> agentic IDE. <br />
                                Build, fix, and scale applications with a specialized AI swarm.
                            </p>
                        </div>

                        <div className="pt-8">
                            <Button
                                size="lg"
                                onClick={ () => setViewMode( 'wizard' ) }
                                className="accent-gradient text-white text-xl px-12 py-6 rounded-2xl shadow-[0_0_40px_rgba(14,165,233,0.3)] hover:shadow-[0_0_60px_rgba(14,165,233,0.5)] hover:scale-105 transition-all duration-300 font-bold tracking-tight border border-white/20"
                                icon={ <PlayIcon /> }
                            >
                                Initialize Studio
                            </Button>
                        </div>

                        <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <div className="p-8 glass-light rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                                <div className="font-mono text-xs text-brand-primary mb-4 uppercase tracking-[0.3em] font-black">Feature 01</div>
                                <div className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">Agent Swarm</div>
                                <p className="text-sm text-slate-400 leading-relaxed font-light">Orchestrate multiple specialized agents working in parallel to build your vision.</p>
                            </div>
                            <div className="p-8 glass rounded-3xl border border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.1)] hover:border-sky-500/50 transition-all group">
                                <div className="font-mono text-xs text-sky-400 mb-4 uppercase tracking-[0.3em] font-black">Innovation</div>
                                <div className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">Self-Healing</div>
                                <p className="text-sm text-slate-400 leading-relaxed font-light">Real-time error detection and automatic code resolution for zero-friction development.</p>
                            </div>
                            <div className="p-8 glass-light rounded-3xl border border-white/5 hover:border-white/20 transition-all group">
                                <div className="font-mono text-xs text-emerald-400 mb-4 uppercase tracking-[0.3em] font-black">Output</div>
                                <div className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Studio Grade</div>
                                <p className="text-sm text-slate-400 leading-relaxed font-light">Professional scaffolding, clean logic, and optimized styling for production-ready apps.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) }

            { viewMode === 'wizard' && (
                <CreateWizard
                    onComplete={ handleProjectCreate }
                    onCancel={ () => setViewMode( 'dashboard' ) }
                />
            ) }

            { viewMode === 'ide' && (
                <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
                    {/* Sidebar - Hidden in Zen Mode */ }
                    { !isZenMode && (
                        <aside className="w-80 glass border-r border-white/5 flex flex-col z-10 shadow-2xl shrink-0 transition-all duration-300">
                            <Panel title="Agent Swarm" className="flex-1 border-b border-white/5 bg-transparent">
                                <div className="divide-y divide-white/5">
                                    { agents.map( agent => (
                                        <AgentCard key={ agent.id } agent={ agent } />
                                    ) ) }
                                </div>
                            </Panel>
                            <Panel title="Execution Plan" className="flex-1 bg-white/5">
                                <div className="p-5 space-y-5">
                                    { steps.map( ( step, index ) => (
                                        <div key={ step.id } className="flex items-start space-x-3 text-sm group">
                                            <div className={ `mt-0.5 shrink-0 transition-transform ${ step.status === 'running' ? 'scale-110' : '' }` }>
                                                { step.status === 'completed' ? <CheckCircleIcon /> :
                                                    step.status === 'running' ? <LoaderIcon /> :
                                                        <CircleIcon /> }
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={ `font-medium transition-colors ${ step.status === 'completed' ? 'text-brand-text-primary' : step.status === 'running' ? 'text-brand-primary' : 'text-brand-text-secondary group-hover:text-slate-300' }` }>
                                                    { step.label }
                                                </span>
                                                { step.status === 'running' && <span className="text-[10px] text-brand-primary/70 animate-pulse mt-0.5">In Progress...</span> }
                                            </div>
                                        </div>
                                    ) ) }
                                </div>
                            </Panel>
                        </aside>
                    ) }

                    {/* Main Area */ }
                    <div className="flex-1 flex flex-col min-w-0 bg-[#020617]">
                        <div className="flex-1 flex min-h-0 relative">
                            {/* Overlay for resizing safety */ }
                            { isResizing && <div className="absolute inset-0 z-50 bg-transparent cursor-col-resize" /> }

                            {/* Editor Column - Hidden in Zen Mode */ }
                            { !isZenMode && (
                                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                                    {/* File Tabs */ }
                                    <div className="h-10 bg-[#020617] flex items-center border-b border-white/5 overflow-x-auto no-scrollbar">
                                        { files.length === 0 && <span className="px-5 text-xs text-slate-500 italic font-mono uppercase tracking-widest opacity-50">... awaiting transmission ...</span> }
                                        { files.map( file => (
                                            <button
                                                key={ file.name }
                                                onClick={ () => setSelectedFile( file ) }
                                                className={ `h-full px-6 flex items-center space-x-3 text-xs border-r border-white/5 transition-all min-w-[140px] max-w-[220px] ${ selectedFile?.name === file.name ? 'bg-sky-500/10 text-sky-400 border-t-2 border-t-sky-500 font-bold' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border-t-2 border-t-transparent' }` }
                                            >
                                                <FileIcon />
                                                <span className="truncate tracking-tight">{ file.name }</span>
                                            </button>
                                        ) ) }
                                    </div>
                                    {/* Code Area */ }
                                    <div className="flex-1 relative min-h-0">
                                        { selectedFile ? (
                                            <CodeEditor
                                                code={ selectedFile.content }
                                                language={ selectedFile.language }
                                                onChange={ updateFileContent }
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 space-y-6 opacity-40">
                                                <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center">
                                                    <FileIcon />
                                                </div>
                                                <p className="text-sm font-black uppercase tracking-[0.2em]">Select a module to examine</p>
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            ) }

                            {/* Resize Handle - Hidden in Zen Mode */ }
                            { !isZenMode && (
                                <div
                                    onMouseDown={ startResizing }
                                    className={ `w-1 bg-[#020617] border-l border-white/5 hover:bg-sky-500 hover:border-sky-500 cursor-col-resize transition-all z-40 shrink-0 flex items-center justify-center ${ isResizing ? 'bg-sky-500 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)]' : '' }` }
                                >
                                </div>
                            ) }

                            {/* Preview Column */ }
                            <div
                                className="flex flex-col bg-slate-100 shrink-0 transition-all duration-500 ease-in-out relative z-30 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                                style={ { width: isZenMode ? '100%' : `${ previewWidth }%` } }
                            >
                                <div className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-20">
                                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-3">
                                        <div className="flex space-x-1.5 opacity-80">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_5px_rgba(248,113,113,0.3)]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.3)]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.3)]"></div>
                                        </div>
                                        <span className="ml-4 font-black tracking-widest text-[10px] text-slate-400 uppercase">Live Preview</span>
                                    </span>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center bg-slate-100 rounded-lg p-1 space-x-0.5 border border-slate-200 shadow-inner">
                                            <button onClick={ () => setPreviewMode( 'desktop' ) } className={ `px-2 py-1.5 rounded-md ${ previewMode === 'desktop' ? 'bg-white shadow text-sky-600' : 'text-slate-400 hover:text-slate-600' }` } title="Desktop View"><DesktopIcon /></button>
                                            <button onClick={ () => setPreviewMode( 'tablet' ) } className={ `px-2 py-1.5 rounded-md ${ previewMode === 'tablet' ? 'bg-white shadow text-sky-600' : 'text-slate-400 hover:text-slate-600' }` } title="Tablet View"><TabletIcon /></button>
                                            <button onClick={ () => setPreviewMode( 'mobile' ) } className={ `px-2 py-1.5 rounded-md ${ previewMode === 'mobile' ? 'bg-white shadow text-sky-600' : 'text-slate-400 hover:text-slate-600' }` } title="Mobile View"><MobileIcon /></button>
                                        </div>

                                        <div className="w-px h-6 bg-slate-200"></div>

                                        <button
                                            onClick={ toggleZenMode }
                                            className={ `p-2 rounded-lg transition-all duration-300 ${ isZenMode ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400 hover:text-sky-600 hover:bg-slate-100' }` }
                                            title={ isZenMode ? "Exit Zen Mode (Esc)" : "Enter Zen Mode (Ctrl+Shift+Z)" }
                                        >
                                            { isZenMode ? <MinimizeIcon /> : <MaximizeIcon /> }
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 relative bg-slate-50 flex flex-col items-center overflow-auto py-12 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:24px_24px]">
                                    <div className={ `transition-all duration-700 ease-in-out bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] shrink-0 overflow-hidden relative ${ previewMode === 'mobile' ? 'w-[375px] h-[750px] rounded-[3.5rem] border-[12px] border-slate-900 shadow-2xl scale-95' :
                                            previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-[2.5rem] border-[12px] border-slate-900 shadow-2xl scale-75' :
                                                'w-full h-full border-none rounded-none'
                                        }` }>
                                        <iframe
                                            ref={ iframeRef }
                                            className={ `w-full h-full border-none bg-white ${ isResizing ? 'pointer-events-none' : '' }` }
                                            title="App Preview"
                                            sandbox="allow-scripts allow-modals allow-same-origin"
                                        />
                                        { files.length === 0 && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-sky-500/20 rounded-full animate-ping"></div>
                                                    <div className="relative bg-white p-6 rounded-full shadow-2xl text-sky-500">
                                                        <LoaderIcon />
                                                    </div>
                                                </div>
                                                <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-400">Transmitting Code...</p>
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terminal - Hidden in Zen Mode */ }
                        { !isZenMode && (
                            <div className="h-56 glass border-t border-white/5 flex flex-col shrink-0 transition-all duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] z-20">
                                <div className="h-10 flex items-center justify-between px-6 bg-white/5 border-b border-white/5 shrink-0">
                                    <div className="flex items-center space-x-3 text-sky-400 group cursor-pointer">
                                        <TerminalIcon />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-white transition-colors">Internal Telemetry</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500/50"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500/20"></div>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                                    { logs.length === 0 && (
                                        <div className="text-slate-600 italic">System ready. Waiting for instructions...</div>
                                    ) }
                                    { logs.map( log => (
                                        <div key={ log.id } className="flex items-start space-x-3 hover:bg-white/5 p-1 rounded transition-colors group">
                                            <span className="text-slate-600 shrink-0 select-none w-16 text-right">[{ log.timestamp }]</span>
                                            <span className={ `font-bold shrink-0 w-24 text-right tracking-tight ${ log.agentId === 'system' ? 'text-brand-primary' :
                                                log.agentId === '1' ? 'text-purple-400' :
                                                    log.agentId === '2' ? 'text-blue-400' :
                                                        log.agentId === '3' ? 'text-pink-400' :
                                                            log.agentId === '4' ? 'text-orange-400' :
                                                                'text-red-400'
                                                }` }>
                                                { log.agentId === 'system' ? 'SYSTEM' :
                                                    agents.find( a => a.id === log.agentId )?.name || 'UNKNOWN' }
                                            </span>
                                            <span className={ `${ log.type === 'error' ? 'text-red-200 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20' :
                                                log.type === 'success' ? 'text-emerald-400' :
                                                    log.type === 'warning' ? 'text-amber-400' :
                                                        log.type === 'chat' ? 'text-cyan-200/80 italic pl-2 border-l-2 border-cyan-500/30' :
                                                            log.type === 'cmd' ? 'text-brand-text-primary font-bold border-b border-slate-700 pb-1 w-full block' :
                                                                'text-slate-300'
                                                } break-all flex-1` }>
                                                { log.message }
                                            </span>
                                        </div>
                                    ) ) }
                                    <div ref={ logsEndRef } />
                                </div>
                            </div>
                        ) }
                    </div>
                </div>
            ) }

            {/* Refine Modal */ }
            <RefineModal
                isOpen={ isRefineModalOpen }
                onClose={ () => setIsRefineModalOpen( false ) }
                onSubmit={ handleRefinement }
                isProcessing={ isRefining }
            />
        </div>
    );
};

export default App;
