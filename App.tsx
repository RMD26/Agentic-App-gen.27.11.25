
import React, { useState, useEffect, useRef } from 'react';
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
import { Agent, LogEntry, File, ExecutionStep, ProjectConfig, ViewMode, ChatMessage, AspectRatio, ImageSize, ProjectAsset } from './types';
import
{
    FileIcon, TerminalIcon, CheckCircleIcon, CircleIcon, LoaderIcon,
    DesktopIcon, TabletIcon, MobileIcon,
    GeneratorIcon, MaximizeIcon, MinimizeIcon,
    PlayIcon, AlertTriangleIcon, XIcon, SparklesIcon, ExportIcon,
    ImageIcon, BrainIcon
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
    const [ assets, setAssets ] = useState<ProjectAsset[]>( [] );

    // UI Layout State
    const [ sidebarWidth, setSidebarWidth ] = useState( 320 );
    const [ terminalHeight, setTerminalHeight ] = useState( 192 );
    const [ previewWidth, setPreviewWidth ] = useState( 45 );
    const [ activeResizer, setActiveResizer ] = useState<'sidebar' | 'preview' | 'terminal' | null>( null );

    // Gemini Lab / Chat State
    const [ chatMessages, setChatMessages ] = useState<ChatMessage[]>( [] );
    const [ chatInput, setChatInput ] = useState( "" );
    const [ isChatLoading, setIsChatLoading ] = useState( false );
    const [ chatAttachment, setChatAttachment ] = useState<string | null>( null );
    const [ useThinking, setUseThinking ] = useState( false );

    // Image Generation Settings
    const [ imgPrompt, setImgPrompt ] = useState( "" );
    const [ imgRatio, setImgRatio ] = useState<AspectRatio>( "1:1" );
    const [ imgSize, setImgSize ] = useState<ImageSize>( "1K" );
    const [ isGeneratingImg, setIsGeneratingImg ] = useState( false );


    // UI Mode State
    const [ previewMode, setPreviewMode ] = useState<'desktop' | 'tablet' | 'mobile'>( 'desktop' );
    const [ isZenMode, setIsZenMode ] = useState( false );
    const [ activeError, setActiveError ] = useState<string | null>( null );
    const [ isFullscreen, setIsFullscreen ] = useState( false );

    // Refinement State
    const [ isRefineModalOpen, setIsRefineModalOpen ] = useState( false );
    const [ isRefining, setIsRefining ] = useState( false );

    const logsEndRef = useRef<HTMLDivElement>( null );
    const chatEndRef = useRef<HTMLDivElement>( null );
    const iframeRef = useRef<HTMLIFrameElement>( null );
    const previewContainerRef = useRef<HTMLDivElement>( null );

    // Check if in demo mode
    const isDemoMode = !process.env.API_KEY || process.env.API_KEY === 'your_api_key_here' || process.env.API_KEY?.trim() === '';


    useEffect( () =>
    {
        logsEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
    }, [ logs ] );


    useEffect( () =>
    {
        chatEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
    }, [ chatMessages, isChatLoading ] );

    // Fullscreen handlers
    const toggleFullscreen = async () =>
    {
        if ( !previewContainerRef.current ) return;

        try
        {
            if ( !isFullscreen )
            {
                await previewContainerRef.current.requestFullscreen();
                setIsFullscreen( true );
            } else
            {
                await document.exitFullscreen();
                setIsFullscreen( false );
            }
        } catch ( error )
        {
            console.error( 'Fullscreen error:', error );
        }
    };

    // Handle Esc key and fullscreen change events
    useEffect( () =>
    {
        const handleFullscreenChange = () =>
        {
            setIsFullscreen( !!document.fullscreenElement );
        };

        const handleKeyDown = ( e: KeyboardEvent ) =>
        {
            if ( e.key === 'Escape' && isFullscreen )
            {
                setIsFullscreen( false );
            }
        };

        document.addEventListener( 'fullscreenchange', handleFullscreenChange );
        document.addEventListener( 'keydown', handleKeyDown );

        return () =>
        {
            document.removeEventListener( 'fullscreenchange', handleFullscreenChange );
            document.removeEventListener( 'keydown', handleKeyDown );
        };
    }, [ isFullscreen ] );

    // Global Resize Handler
    useEffect( () =>
    {
        if ( !activeResizer ) return;
        const handleMouseMove = ( e: MouseEvent ) =>
        {
            if ( activeResizer === 'preview' )
            {
                const newWidth = ( ( window.innerWidth - e.clientX ) / window.innerWidth ) * 100;
                setPreviewWidth( Math.min( Math.max( newWidth, 20 ), 80 ) );
            } else if ( activeResizer === 'sidebar' )
            {
                const newWidth = e.clientX;
                setSidebarWidth( Math.min( Math.max( newWidth, 200 ), 500 ) );
            } else if ( activeResizer === 'terminal' )
            {
                const newHeight = window.innerHeight - e.clientY;
                setTerminalHeight( Math.min( Math.max( newHeight, 100 ), window.innerHeight * 0.7 ) );
            }
        };
        const handleMouseUp = () => setActiveResizer( null );
        window.addEventListener( 'mousemove', handleMouseMove );
        window.addEventListener( 'mouseup', handleMouseUp );
        return () =>
        {
            window.removeEventListener( 'mousemove', handleMouseMove );
            window.removeEventListener( 'mouseup', handleMouseUp );
        };
    }, [ activeResizer ] );

    // Handle Chat interaction
    const handleChatSend = async () =>
    {
        if ( !chatInput.trim() && !chatAttachment ) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: chatInput,
            timestamp: new Date(),
            attachment: chatAttachment || undefined
        };

        setChatMessages( prev => [ ...prev, userMsg ] );
        setChatInput( "" );
        setChatAttachment( null );
        setIsChatLoading( true );

        try
        {
            const history = chatMessages.map( m => ( {
                role: m.role,
                parts: [ { text: m.text } ]
            } ) );

            const response = await aiService.chat( userMsg.text, history, userMsg.attachment, useThinking );

            setChatMessages( prev => [ ...prev, {
                id: ( Date.now() + 1 ).toString(),
                role: 'model',
                text: response || "I'm sorry, I couldn't process that.",
                timestamp: new Date(),
                isThinking: useThinking
            } ] );
        } catch ( e )
        {
            setActiveError( "Chat failed to reach Gemini." );
        } finally
        {
            setIsChatLoading( false );
        }
    };

    // Handle Image Upload for analysis
    const handleImageUpload = ( e: React.ChangeEvent<HTMLInputElement> ) =>
    {
        const file = e.target.files?.[ 0 ];
        if ( file )
        {
            const reader = new FileReader();
            reader.onloadend = () => setChatAttachment( reader.result as string );
            reader.readAsDataURL( file );
        }
    };

    // Handle Image Asset Generation
    const handleGenerateImg = async () =>
    {
        if ( !imgPrompt.trim() ) return;
        setIsGeneratingImg( true );
        addLog( `Generating ${ imgSize } ${ imgRatio } asset...`, '3', 'info' );
        try
        {
            const url = await aiService.generateImage( imgPrompt, imgRatio, imgSize );
            setAssets( prev => [ ...prev, { id: Date.now().toString(), type: 'image', url, prompt: imgPrompt } ] );
            addLog( "New visual asset generated by Gemini 3 Pro Image.", '3', 'success' );
            setImgPrompt( "" );
        } catch ( e )
        {
            setActiveError( "Image generation failed." );
        } finally
        {
            setIsGeneratingImg( false );
        }
    };


    // Update preview - Only when project is ready
    useEffect( () =>
    {
        // Only update preview when project is completed to avoid unnecessary reloads
        if ( completed && files.length > 0 && iframeRef.current )
        {
            const htmlFile = files.find( f => f.name.toLowerCase() === 'index.html' );
            const cssFile = files.find( f => f.name.toLowerCase() === 'style.css' );
            const jsFile = files.find( f => f.name.toLowerCase() === 'app.js' );
            if ( htmlFile )
            {
                let content = htmlFile.content;
                if ( cssFile ) content = content.replace( '</head>', `<style>${ cssFile.content }</style></head>` );
                if ( jsFile ) content = content.replace( '</body>', `<script>${ jsFile.content }</script></body>` );
                iframeRef.current.srcdoc = content;
            }
        }
    }, [ files, completed ] );

    const addLog = ( message: string, agentId: string = 'system', type: LogEntry[ 'type' ] = 'info' ) =>
    {
        setLogs( prev => [ ...prev, {
            id: Math.random().toString( 36 ).substr( 2, 9 ),
            timestamp: new Date().toLocaleTimeString(),
            agentId, message, type
        } ] );
    };

    const handleProjectCreate = ( config: ProjectConfig ) =>
    {
        setProjectConfig( config );
        setViewMode( 'ide' );
        setTimeout( () => runForgeWorkflow( config ), 0 );
    };

    const runForgeWorkflow = async ( config: ProjectConfig ) =>
    {
        try
        {
            setCompleted( false );
            setFiles( [] );
            setLogs( [] );
            addLog( `Initializing Agent Swarm for "${ config.name }"`, 'system', 'cmd' );
            for ( let i = 1; i <= 6; i++ )
            {
                setSteps( prev => prev.map( s => s.id === i ? { ...s, status: 'running' } : s ) );
                const res = await aiService.generateStep( i, { config, currentFiles: files } );
                if ( res.files )
                {
                    setFiles( prev => [ ...prev, ...res.files ] );
                    if ( res.files[ 0 ] ) setSelectedFile( res.files[ 0 ] );
                }
                setSteps( prev => prev.map( s => s.id === i ? { ...s, status: 'completed' } : s ) );
                addLog( `Step ${ i } complete.`, i.toString(), 'success' );
            }
            setCompleted( true );
        } catch ( error )
        {
            setActiveError( "Workflow encountered a critical error." );
        }
    };

    return (
        <div className={ `flex flex-col h-screen bg-brand-background text-brand-text-primary overflow-hidden relative` }>
            { !isZenMode && (
                <Header
                    viewMode={ viewMode }
                    onNavigateHome={ () => setViewMode( 'dashboard' ) }
                    onExport={ () => zipService.downloadProject( files, projectConfig?.name || "App" ) }
                    onRefine={ () => setIsRefineModalOpen( true ) }
                    canExport={ completed }
                    canRefine={ completed }
                />
            ) }

            { viewMode === 'dashboard' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
                    { isDemoMode && (
                        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 max-w-3xl w-full">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🎭</div>
                                <div className="flex-1">
                                    <h3 className="text-amber-400 font-bold text-sm">Demo Mode Active</h3>
                                    <p className="text-amber-200/70 text-xs mt-1">
                                        Using mock AI responses. Add your Gemini API key to <code className="bg-amber-900/30 px-1 rounded">.env.local</code> for real AI generation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) }
                    <div className="max-w-3xl w-full text-center space-y-12">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-brand-surface rounded-3xl flex items-center justify-center border border-slate-700 shadow-2xl"><GeneratorIcon /></div>
                        </div>
                        <h2 className="text-6xl font-extrabold text-white tracking-tight leading-tight">Gemini 3 Powered<br />Agentic Workspace</h2>
                        <Button size="lg" onClick={ () => setViewMode( 'wizard' ) } className="text-lg px-10 py-5" icon={ <PlayIcon /> }>New Project</Button>
                    </div>
                </div>
            ) }

            { viewMode === 'wizard' && <CreateWizard onComplete={ handleProjectCreate } onCancel={ () => setViewMode( 'dashboard' ) } /> }

            { viewMode === 'ide' && (
                <div className="flex-1 flex overflow-hidden">
                    { !isZenMode && (
                        <aside className="bg-ide-sidebar border-r border-ide-border flex flex-col shrink-0 relative" style={ { width: `${ sidebarWidth }px` } }>
                            <Panel title="Agent Swarm" className="h-64 border-b border-ide-border">
                                { agents.map( agent => <AgentCard key={ agent.id } agent={ agent } /> ) }
                            </Panel>

                            <Panel title="Gemini Lab" className="flex-1">
                                <div className="p-4 space-y-4">
                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Image Asset Generation</label>
                                        <textarea
                                            value={ imgPrompt }
                                            onChange={ e => setImgPrompt( e.target.value ) }
                                            placeholder="Describe a new asset..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs mb-3 outline-none focus:border-brand-primary"
                                        />
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <select aria-label="Aspect Ratio" value={ imgRatio } onChange={ e => setImgRatio( e.target.value as AspectRatio ) } className="bg-slate-900 border border-slate-700 rounded p-1 text-[10px] outline-none">
                                                { [ '1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9' ].map( r => <option key={ r } value={ r }>{ r }</option> ) }
                                            </select>
                                            <select aria-label="Image Size" value={ imgSize } onChange={ e => setImgSize( e.target.value as ImageSize ) } className="bg-slate-900 border border-slate-700 rounded p-1 text-[10px] outline-none">
                                                { [ '1K', '2K', '4K' ].map( s => <option key={ s } value={ s }>{ s }</option> ) }
                                            </select>
                                        </div>
                                        <Button size="sm" className="w-full" onClick={ handleGenerateImg } isLoading={ isGeneratingImg }>Generate Asset</Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        { assets.map( a => (
                                            <div key={ a.id } className="aspect-square bg-slate-900 rounded border border-slate-700 overflow-hidden relative group">
                                                <img src={ a.url } className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <button onClick={ () => window.open( a.url ) } className="text-white" aria-label="Export Asset"><ExportIcon /></button>
                                                </div>
                                            </div>
                                        ) ) }
                                    </div>
                                </div>
                            </Panel>

                            <div onMouseDown={ () => setActiveResizer( 'sidebar' ) } className="absolute top-0 -right-1 bottom-0 w-2 cursor-col-resize z-50 group transition-colors hover:bg-brand-primary/30"></div>
                        </aside>
                    ) }

                    <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                        <div className="flex-1 flex min-h-0 relative">
                            { !isZenMode && (
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="h-9 bg-ide-bg flex items-center border-b border-ide-border">
                                        { files.map( file => (
                                            <button key={ file.name } onClick={ () => setSelectedFile( file ) } className={ `h-full px-4 flex items-center space-x-2 text-xs border-r border-ide-border ${ selectedFile?.name === file.name ? 'bg-[#1e1e1e] text-brand-primary border-t-2 border-t-brand-primary' : 'bg-[#2d2d2d] text-slate-400' }` }>
                                                <FileIcon /> <span>{ file.name }</span>
                                            </button>
                                        ) ) }
                                    </div>
                                    <div className="flex-1 relative min-h-0"><CodeEditor code={ selectedFile?.content || "" } language={ selectedFile?.language || "" } onChange={ ( c ) => setSelectedFile( prev => prev ? { ...prev, content: c } : null ) } /></div>
                                </div>
                            ) }


                            { !isZenMode && <div onMouseDown={ () => setActiveResizer( 'preview' ) } className="w-1.5 bg-ide-bg border-l border-ide-border hover:bg-brand-primary cursor-col-resize z-40 shrink-0"></div> }

                            <div
                                ref={ previewContainerRef }
                                className={ `flex flex-col bg-slate-100 shrink-0 relative z-30 shadow-2xl ${ isFullscreen ? 'fixed inset-0 z-[9999]' : '' }` }
                                style={ { width: isZenMode || isFullscreen ? '100%' : `${ previewWidth }%` } }
                            >
                                <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
                                    <span className="text-xs font-mono text-slate-400">localhost:3000</span>
                                    <div className="flex items-center gap-2">
                                        { isFullscreen ? (
                                            <button
                                                onClick={ toggleFullscreen }
                                                className="px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center gap-1.5"
                                                title="Exit Fullscreen (Esc)"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Exit Fullscreen
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={ toggleFullscreen }
                                                    className="px-3 py-1.5 text-xs font-medium bg-brand-primary hover:bg-brand-primary/80 text-white rounded-md transition-colors flex items-center gap-1.5"
                                                    title="Preview in Fullscreen"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                    Preview
                                                </button>
                                                <button onClick={ () => setIsZenMode( !isZenMode ) } className="p-1.5 text-slate-400" title="Toggle Zen Mode">
                                                    <MaximizeIcon />
                                                </button>
                                            </>
                                        ) }
                                    </div>
                                </div>
                                <div className="flex-1 relative bg-slate-200/50 flex flex-col items-center py-6">
                                    <div className={ `transition-all bg-white shadow-2xl shrink-0 overflow-hidden ${ previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full' }` }>
                                        <iframe ref={ iframeRef } className="w-full h-full border-none bg-white" sandbox="allow-scripts allow-modals allow-same-origin" title="Preview" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        { !isZenMode && (
                            <div className="bg-ide-bg border-t border-ide-border flex flex-col shrink-0 z-20 relative" style={ { height: `${ terminalHeight }px` } }>
                                <div onMouseDown={ () => setActiveResizer( 'terminal' ) } className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize z-50 hover:bg-brand-primary/30"></div>
                                <div className="h-8 flex items-center px-4 bg-[#1e1e1e] border-b border-ide-border">
                                    <TerminalIcon /> <span className="ml-2 text-xs font-mono text-slate-400">Output</span>
                                </div>
                                <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto space-y-1">
                                    { logs.map( log => (
                                        <div key={ log.id } className="flex space-x-3">
                                            <span className="text-slate-600">[{ log.timestamp }]</span>
                                            <span className={ `font-bold ${ log.agentId === 'system' ? 'text-brand-primary' : 'text-orange-400' }` }>{ log.agentId.toUpperCase() }</span>
                                            <span className="text-slate-300">{ log.message }</span>
                                        </div>
                                    ) ) }
                                    <div ref={ logsEndRef } />
                                </div>
                            </div>
                        ) }
                    </div>

                    {/* AI Powered Chatbot Sidebar */ }
                    { !isZenMode && (
                        <aside className="w-80 bg-brand-surface border-l border-slate-700 flex flex-col">
                            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Gemini Assistant</h3>
                                <button
                                    onClick={ () => setUseThinking( !useThinking ) }
                                    className={ `flex items-center space-x-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all border ${ useThinking
                                        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                                        }` }
                                >
                                    <BrainIcon />
                                    <span>Deep Think</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                { chatMessages.map( m => (
                                    <div key={ m.id } className={ `flex flex-col ${ m.role === 'user' ? 'items-end' : 'items-start' }` }>
                                        { m.attachment && <img src={ m.attachment } className="max-w-[150px] rounded-lg mb-1 border border-slate-700" /> }
                                        <div className={ `p-3 rounded-2xl text-xs max-w-[90%] ${ m.role === 'user' ? 'bg-brand-primary text-white' : 'bg-slate-800 text-slate-200' }` }>
                                            { m.isThinking && <div className="text-[9px] text-brand-primary font-bold mb-1 uppercase tracking-tighter">Analyzed Deeply</div> }
                                            { m.text }
                                        </div>
                                    </div>
                                ) ) }
                                { isChatLoading && (
                                    <div className="flex items-start space-x-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                                            <span className="text-[10px] font-bold text-brand-primary">G</span>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none border border-slate-700/50 flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium italic">Gemini is thinking...</span>
                                        </div>
                                    </div>
                                ) }
                                <div ref={ chatEndRef } />
                            </div>

                            <div className="p-4 border-t border-slate-700 space-y-2">
                                { chatAttachment && (
                                    <div className="relative inline-block">
                                        <img src={ chatAttachment } className="h-12 w-12 rounded border border-brand-primary object-cover" />
                                        <button onClick={ () => setChatAttachment( null ) } className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" aria-label="Remove Attachment"><XIcon /></button>
                                    </div>
                                ) }
                                <div className="flex items-center space-x-2">
                                    <label className="cursor-pointer text-slate-400 hover:text-brand-primary p-2 bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-600">
                                        <ImageIcon />
                                        <input type="file" className="hidden" accept="image/*" onChange={ handleImageUpload } />
                                    </label>
                                    <input
                                        type="text"
                                        value={ chatInput }
                                        onChange={ e => setChatInput( e.target.value ) }
                                        onKeyDown={ e => e.key === 'Enter' && handleChatSend() }
                                        placeholder="Ask about the code or upload a design..."
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-primary"
                                    />
                                    <button onClick={ handleChatSend } className="p-2 bg-brand-primary text-white rounded-lg" aria-label="Send Message"><SparklesIcon /></button>
                                </div>
                            </div>
                        </aside>
                    ) }
                </div>
            ) }

            <RefineModal isOpen={ isRefineModalOpen } onClose={ () => setIsRefineModalOpen( false ) } onSubmit={ async ( i ) => { setIsRefineModalOpen( false ); setIsRefining( true ); addLog( `Refining: ${ i }`, 'system', 'cmd' ); const uf = await aiService.refineCode( files, i, projectConfig! ); setFiles( prev => { const nf = [ ...prev ]; uf.forEach( f => { const idx = nf.findIndex( x => x.name === f.name ); if ( idx !== -1 ) nf[ idx ] = f; else nf.push( f ); } ); return nf; } ); setIsRefining( false ); } } isProcessing={ isRefining } />
        </div>
    );
};

export default App;
