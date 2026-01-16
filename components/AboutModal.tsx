import React from 'react';
import { XIcon, GeneratorIcon, CheckCircleIcon, TerminalIcon, AlertTriangleIcon } from './Icons';

interface AboutModalProps
{
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ( { isOpen, onClose } ) =>
{
    if ( !isOpen ) return null;

    const agents = [
        { name: 'Atlas', role: 'Planner', description: 'Orchestrates the project lifecycle and maps out requirements nodes.' },
        { name: 'Nexus', role: 'Architect', description: 'Defines the structural graph and system integrity boundaries.' },
        { name: 'Pixel', role: 'Designer', description: 'Synthesizes intent into high-fidelity visual design systems.' },
        { name: 'Spark', role: 'Engineer', description: 'Translates architectural nodes into technical implementation.' },
        { name: 'Sentinel', role: 'Diagnostician', description: 'Monitors the closed-loop system for runtime anomalies and provides live healing.' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#020617] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative">
                {/* Close Button */ }
                <button
                    onClick={ onClose }
                    className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10 z-20"
                >
                    <XIcon />
                </button>

                {/* Content */ }
                <div className="flex-1 overflow-y-auto no-scrollbar p-12 lg:p-16">
                    <div className="flex items-center space-x-6 mb-12">
                        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border border-sky-500/20 shadow-2xl">
                            <div className="text-sky-500 scale-150"><GeneratorIcon /></div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter">
                                Agentic Studio <span className="text-sky-500">Pro</span>
                            </h2>
                            <p className="text-sky-500/60 font-mono text-xs uppercase tracking-[0.3em] mt-1 ml-0.5">The Self-Healing IDE</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-3">
                                <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
                                <span>The Vision</span>
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm lg:text-base font-light">
                                Agentic Studio Pro is a next-generation integrated development environment that utilizes autonomous AI agents to build software.
                                By transitioning from manual syntax writing to an <span className="text-white font-medium">intent-based workflow</span>,
                                we allow the AI to manage the technical implementation while you focus on high-level architecture.
                            </p>
                        </section>

                        <section className="bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-3">
                                <div className="text-sky-500"><AlertTriangleIcon /></div>
                                <span>Closed-Loop Self-Healing</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400"><TerminalIcon /></div>
                                    <div className="font-bold text-white text-sm">Real-time Monitoring</div>
                                    <p className="text-xs text-slate-500">Instrumented sandboxes capture runtime exceptions and console anomalies instantly.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400"><GeneratorIcon /></div>
                                    <div className="font-bold text-white text-sm">Autonomous Diagnosis</div>
                                    <p className="text-xs text-slate-500">Sentinel agents analyze code graph nodes to identify root causes without user input.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400"><CheckCircleIcon /></div>
                                    <div className="font-bold text-white text-sm">Live Repair Patching</div>
                                    <p className="text-xs text-slate-500">The system automatically pushes hot-fixes to the source code and refreshes the live view.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-8 flex items-center space-x-3">
                                <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                <span>Agent Swarm Architecture</span>
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                { agents.map( ( agent, i ) => (
                                    <div key={ i } className="flex items-center space-x-6 p-5 glass-light rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/5 group">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-lg font-black text-white shadow-xl group-hover:scale-110 transition-transform">
                                            { agent.role.charAt( 0 ) }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-bold text-white">{ agent.name }</span>
                                                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">{ agent.role }</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{ agent.description }</p>
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </section>
                    </div>

                    <div className="mt-16 pt-12 border-t border-white/5 text-center text-slate-600 text-xs font-mono tracking-widest">
                        AGENTIC STUDIO PRO • VERSION 1.0 STUDIO EDITION • © 2026
                    </div>
                </div>
            </div>
        </div>
    );
};
