import React, { useState, useRef } from 'react';
import { aiService } from '../services/aiService';
import { GeneratorIcon, AlertTriangleIcon, TerminalIcon } from './Icons';
import { Bar } from 'react-chartjs-2';
import
{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const AILaboratory: React.FC = () =>
{
    // Feature 1: Architect
    const [ appIdea, setAppIdea ] = useState( '' );
    const [ archResult, setArchResult ] = useState( '' );
    const [ isArchLoading, setIsArchLoading ] = useState( false );

    // Feature 2: Critic
    const [ designInput, setDesignInput ] = useState( '' );
    const [ designResult, setDesignResult ] = useState( '' );
    const [ isDesignLoading, setIsDesignLoading ] = useState( false );

    // Feature 3: Patcher
    const [ errorInput, setErrorInput ] = useState( '' );
    const [ patcherResult, setPatcherResult ] = useState( '' );
    const [ isPatcherLoading, setIsPatcherLoading ] = useState( false );

    // Feature 4: Audio
    const [ isAudioPlaying, setIsAudioPlaying ] = useState( false );
    const [ audioStatus, setAudioStatus ] = useState( '' );
    const audioRef = useRef<HTMLAudioElement | null>( null );

    const generateArchitecture = async () =>
    {
        if ( !appIdea ) return;
        setIsArchLoading( true );
        setArchResult( 'Generating file structure...' );
        const prompt = `Design an architecture for: ${ appIdea }`;
        const sys = "You are the 'Atlas' Planner agent. Propose a folder and file structure for a modern web project. Be concise and professional.";
        const result = await aiService.generateText( prompt, sys );
        setArchResult( result );
        setIsArchLoading( false );
    };

    const critiqueDesign = async () =>
    {
        if ( !designInput ) return;
        setIsDesignLoading( true );
        setDesignResult( 'Visual Designer agent is evaluating aesthetics...' );
        const prompt = `Critique this design/code: ${ designInput }`;
        const sys = "You are the 'Pixel' Designer agent. Evaluate visual consistency, accessibility, and modern trends (Tailwind, spacing).";
        const result = await aiService.generateText( prompt, sys );
        setDesignResult( result );
        setIsDesignLoading( false );
    };

    const explainError = async () =>
    {
        if ( !errorInput ) return;
        setIsPatcherLoading( true );
        setPatcherResult( 'Patcher agent is analyzing stderr...' );
        const prompt = `Explain this error: ${ errorInput }`;
        const sys = "You are the 'Sentinel' Patcher agent. Identify the root cause of the error and suggest a surgical fix.";
        const result = await aiService.generateText( prompt, sys );
        setPatcherResult( result );
        setIsPatcherLoading( false );
    };

    const playAudioGuide = async () =>
    {
        setIsAudioPlaying( true );
        setAudioStatus( 'Generating voice briefing...' );
        const text = "Agentic Studio Pro is a closed-loop architecture that transforms the developer into an architect of intent. It utilizes WebContainers to run code directly in the browser and specialized agents for autonomous error healing.";

        try
        {
            const { pcmData, sampleRate } = await aiService.generateSpeech( text );
            const audioBlob = pcmToWav( pcmData, sampleRate );
            const audioUrl = URL.createObjectURL( audioBlob );
            const audio = new Audio( audioUrl );
            audioRef.current = audio;

            setAudioStatus( 'Playing...' );
            audio.play();
            audio.onended = () =>
            {
                setIsAudioPlaying( false );
                setAudioStatus( 'Playback finished.' );
            };
        } catch ( e )
        {
            setAudioStatus( 'Audio service error.' );
            setIsAudioPlaying( false );
        }
    };

    const pcmToWav = ( base64: string, sampleRate: number ) =>
    {
        const buffer = Uint8Array.from( atob( base64 ), c => c.charCodeAt( 0 ) ).buffer;
        const wav = new ArrayBuffer( 44 + buffer.byteLength );
        const view = new DataView( wav );

        view.setUint32( 0, 0x52494646, false ); // "RIFF"
        view.setUint32( 4, 36 + buffer.byteLength, true );
        view.setUint32( 8, 0x57415645, false ); // "WAVE"
        view.setUint32( 12, 0x666d7420, false ); // "fmt "
        view.setUint32( 16, 16, true );
        view.setUint16( 20, 1, true ); // PCM
        view.setUint16( 22, 1, true ); // Mono
        view.setUint32( 24, sampleRate, true );
        view.setUint32( 28, sampleRate * 2, true );
        view.setUint16( 32, 2, true );
        view.setUint16( 34, 16, true );
        view.setUint32( 36, 0x64617461, false ); // "data"
        view.setUint32( 40, buffer.byteLength, true );

        const samples = new Uint8Array( wav, 44 );
        samples.set( new Uint8Array( buffer ) );
        return new Blob( [ wav ], { type: 'audio/wav' } );
    };

    const chartData = {
        labels: [ 'Creative Work', 'Debugging' ],
        datasets: [
            {
                label: 'Standard AI',
                data: [ 30, 70 ],
                backgroundColor: '#ef4444',
            },
            {
                label: 'Agentic Studio Pro',
                data: [ 85, 15 ],
                backgroundColor: '#06b6d4',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94a3b8' } },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(30, 41, 59, 0.5)' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                ticks: { color: '#94a3b8' }
            }
        }
    };

    return (
        <div className="space-y-16">
            {/* Efficiency Section */ }
            <section>
                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">The "Open-Loop" Crisis</h2>
                    <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                        Traditional tools ignore the outcome. ASP validates it.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="bg-slate-900/50 rounded-3xl p-8 border border-white/5 shadow-2xl">
                        <h3 className="text-lg font-semibold text-rose-500 mb-6 flex items-center">
                            <span className="text-xl mr-3">⚠️</span> The "Hollow App" Problem
                        </h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Most generated code lacks real data. Planner agents in ASP must define <code className="text-rose-400 font-mono">mockData.ts</code> so the app feels alive immediately.
                        </p>
                        <div className="h-[300px]">
                            <Bar data={ chartData } options={ chartOptions as any } />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-sky-500/20 transition-all group">
                            <h4 className="font-bold text-sky-400 mb-2 group-hover:translate-x-1 transition-transform">WebContainers (Wasm)</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Full Node.js runtime running in the browser sandbox with latency under 5ms.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all group">
                            <h4 className="font-bold text-purple-400 mb-2 group-hover:translate-x-1 transition-transform">LangGraph Orchestration</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Agent orchestration using cyclic graphs, allowing fallback to "Patcher" agents on failure.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Lab Section */ }
            <section className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">Interactive AI Laboratory ✨</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm">
                        Experience the power of Gemini models directly simulating the cognitive tasks of our agent swarm.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Architecture Planner */ }
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-sky-500/30 transition-all group flex flex-col">
                        <h3 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
                            <GeneratorIcon /> Architecture Planner
                        </h3>
                        <textarea
                            value={ appIdea }
                            onChange={ ( e ) => setAppIdea( e.target.value ) }
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-xs mb-4 focus:ring-2 focus:ring-sky-500 outline-none h-24 text-slate-300"
                            placeholder="Describe your application idea..."
                        />
                        <button
                            onClick={ generateArchitecture }
                            disabled={ isArchLoading || !appIdea }
                            className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm mb-4"
                        >
                            { isArchLoading ? 'Planning Structure...' : 'Design Architecture ✨' }
                        </button>
                        { archResult && (
                            <div className="bg-slate-950/80 rounded-xl p-4 font-mono text-[10px] text-sky-300 max-h-40 overflow-y-auto border border-sky-900/30 whitespace-pre-wrap">
                                { archResult }
                            </div>
                        ) }
                    </div>

                    {/* Design Critic */ }
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all group flex flex-col">
                        <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <GeneratorIcon /> Design Critic
                        </h3>
                        <textarea
                            value={ designInput }
                            onChange={ ( e ) => setDesignInput( e.target.value ) }
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-xs mb-4 focus:ring-2 focus:ring-purple-500 outline-none h-24 text-slate-300"
                            placeholder="Paste component description or code..."
                        />
                        <button
                            onClick={ critiqueDesign }
                            disabled={ isDesignLoading || !designInput }
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm mb-4"
                        >
                            { isDesignLoading ? 'Analyzing Aesthetics...' : 'Analyze Aesthetics ✨' }
                        </button>
                        { designResult && (
                            <div className="bg-slate-950/80 rounded-xl p-4 text-[10px] text-purple-200 border border-purple-900/30 whitespace-pre-wrap">
                                { designResult }
                            </div>
                        ) }
                    </div>

                    {/* Patcher Explainer */ }
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all group flex flex-col">
                        <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                            <TerminalIcon /> Patcher Explainer
                        </h3>
                        <textarea
                            value={ errorInput }
                            onChange={ ( e ) => setErrorInput( e.target.value ) }
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-xs mb-4 focus:ring-2 focus:ring-rose-500 outline-none h-24 text-slate-300"
                            placeholder="Paste a terminal error or bug report..."
                        />
                        <button
                            onClick={ explainError }
                            disabled={ isPatcherLoading || !errorInput }
                            className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm mb-4"
                        >
                            { isPatcherLoading ? 'Finding Remedy...' : 'Propose Fix ✨' }
                        </button>
                        { patcherResult && (
                            <div className="bg-slate-950/80 rounded-xl p-4 text-[10px] text-rose-200 border border-rose-900/30 whitespace-pre-wrap">
                                { patcherResult }
                            </div>
                        ) }
                    </div>

                    {/* Voice Guide */ }
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all group flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                <AlertTriangleIcon /> Voice Guide
                            </h3>
                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                Listen to a synthetic briefing about the Agentic Studio Pro ecosystem powered by Gemini's native audio generation.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={ playAudioGuide }
                                disabled={ isAudioPlaying }
                                className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
                            >
                                <span>{ isAudioPlaying ? 'Playing Briefing...' : 'Start Audio Briefing ✨' }</span>
                                { isAudioPlaying && (
                                    <div className="flex items-center gap-1 h-3">
                                        <div className="w-1 bg-white rounded-full animate-bounce h-2" />
                                        <div className="w-1 bg-white rounded-full animate-bounce h-3 delay-75" />
                                        <div className="w-1 bg-white rounded-full animate-bounce h-2 delay-150" />
                                    </div>
                                ) }
                            </button>
                            { audioStatus && (
                                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">{ audioStatus }</p>
                            ) }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
