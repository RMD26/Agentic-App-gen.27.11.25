import { ProjectState, ProjectPhase, LogEntry, File, Agent } from '../types';

// ========== COMPRESSION TYPES ==========

export interface CompressionConfig
{
    maxTotalTokens: number;
    criticalTokenBudget: number;
    recentTokenBudget: number;
    compressionThreshold: number; // Percentage (e.g., 80 = compress at 80% capacity)
}

export interface FileMetadata
{
    name: string;
    language: string;
    size: number;
    lines: number;
    summary: string;
    exports?: string[];
    imports?: string[];
    lastModified: string;
}

export interface LogSummary
{
    timeRange: { start: string; end: string };
    totalEntries: number;
    summary: string;
    errorCount: number;
    warningCount: number;
    criticalErrors?: string[];
}

export interface PhaseSummary
{
    phase: ProjectPhase;
    agent: string;
    summary: string;
    outcome: any;
    duration: string;
    status: 'complete' | 'failed' | 'skipped';
    timestamp: string;
}

export interface Issue
{
    id: string;
    type: 'error' | 'clarification' | 'warning';
    message: string;
    phase: ProjectPhase;
    resolved: boolean;
    timestamp: string;
}

export interface CompressedContext
{
    // NEVER COMPRESSED - Critical architectural data
    critical: {
        projectConfig: {
            name: string;
            description: string;
            features: string[];
            theme: string;
        };
        designSystem: {
            colors: {
                primary: string;
                secondary: string;
                background: string;
                surface: string;
                text: string;
                accent: string;
            };
            radius: string;
            font: string;
            spacing: string;
        };
        fileStructure: string[];
        currentPhase: ProjectPhase;
        unresolvedIssues: Issue[];
        healingAttempts: number;
        mockDataSchema?: Record<string, any>;
    };

    // COMPRESSED - Historical data
    history: {
        completedPhases: PhaseSummary[];
        archivedLogs: LogSummary[];
        fileMetadata: FileMetadata[];
    };

    // RECENT - Uncompressed recent context
    recent: {
        lastActions: Array<{
            agent: string;
            action: string;
            timestamp: string;
        }>;
        lastErrors: Array<{
            message: string;
            phase: ProjectPhase;
            timestamp: string;
        }>;
        currentFiles: File[]; // Only current working files
    };

    // Metadata
    meta: {
        compressedAt: string;
        originalTokens: number;
        compressedTokens: number;
        compressionRatio: number;
    };
}

export interface AgentAction
{
    agent: string;
    action: string;
    timestamp: string;
    phase: ProjectPhase;
}

export interface ErrorLog
{
    message: string;
    phase: ProjectPhase;
    timestamp: string;
    stackTrace?: string;
}
