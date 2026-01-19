import { ProjectPhase } from '../types';

/**
 * Compression Rules Engine
 * Defines what MUST NEVER be compressed and compression strategies
 */

export const COMPRESSION_RULES = {
    // What NEVER gets compressed
    preserve: {
        projectConfig: true,
        designSystem: true,
        fileStructure: true,
        currentPhase: true,
        unresolvedIssues: true,
        userClarifications: true,
        recentErrors: true,
        mockDataSchema: true,
        healingAttempts: true,
    },

    // Compression strategies by data type
    strategies: {
        logs: 'summarize' as const,
        files: 'metadata' as const,
        agentActions: 'recent-only' as const,
        errors: 'keep-all' as const,
        completedPhases: 'summarize' as const,
    },

    // Temporal rules (in milliseconds)
    temporal: {
        recentWindow: 5 * 60 * 1000, // 5 minutes - keep full detail
        archiveWindow: 15 * 60 * 1000, // 15 minutes - archive to metadata
    },

    // Token budgets (percentages)
    budgets: {
        critical: 0.20, // 20% for critical data
        recent: 0.30, // 30% for recent context
        history: 0.10, // 10% for compressed history
        available: 0.40, // 40% for new work
    },

    // What to keep in recent context
    recentLimits: {
        actions: 5, // Last 5 agent actions
        errors: 3, // Last 3 errors
        files: 10, // Last 10 modified files
    },
};

/**
 * Determine if data should be preserved based on rules
 */
export function shouldPreserve ( dataType: keyof typeof COMPRESSION_RULES.preserve ): boolean
{
    return COMPRESSION_RULES.preserve[ dataType ] === true;
}

/**
 * Get compression strategy for data type
 */
export function getCompressionStrategy (
    dataType: keyof typeof COMPRESSION_RULES.strategies
): string
{
    return COMPRESSION_RULES.strategies[ dataType ];
}

/**
 * Check if timestamp is within recent window
 */
export function isRecent ( timestamp: string ): boolean
{
    const now = Date.now();
    const time = new Date( timestamp ).getTime();
    return now - time < COMPRESSION_RULES.temporal.recentWindow;
}

/**
 * Check if timestamp should be archived
 */
export function shouldArchive ( timestamp: string ): boolean
{
    const now = Date.now();
    const time = new Date( timestamp ).getTime();
    return now - time > COMPRESSION_RULES.temporal.archiveWindow;
}

/**
 * Phase-specific preservation rules
 */
export const PHASE_PRESERVATION_RULES: Record<ProjectPhase, string[]> = {
    planning: [ 'features', 'mockDataSchema', 'fileStructure' ],
    designing: [ 'designSystem', 'colors', 'theme' ],
    architecting: [ 'fileStructure', 'imports', 'exports' ],
    coding: [ 'files', 'mockData', 'components' ],
    healing: [ 'errors', 'fixes', 'healingAttempts' ],
    ready: [ 'finalState', 'verification' ],
};

/**
 * Get what must be preserved for a specific phase
 */
export function getPhasePreservation ( phase: ProjectPhase ): string[]
{
    return PHASE_PRESERVATION_RULES[ phase ] || [];
}
