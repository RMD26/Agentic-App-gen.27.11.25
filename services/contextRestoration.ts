import { ProjectState, ProjectPhase, File } from '../types';
import { CompressedContext, FileMetadata, LogSummary, PhaseSummary } from '../types/compression';
import { getPhasePreservation } from './compressionRules';

/**
 * Context Restoration Service
 * Restores full context from compressed data when needed
 */
export class ContextRestorationService
{
    /**
     * Restore full ProjectState from compressed context
     */
    restore ( compressed: CompressedContext, targetPhase?: ProjectPhase ): ProjectState
    {
        const phase = targetPhase || compressed.critical.currentPhase;

        // Reconstruct ProjectState
        const state: ProjectState = {
            phase,
            plan: {
                features: compressed.critical.projectConfig.features,
                fileStructure: compressed.critical.fileStructure,
                mockDataSchema: compressed.critical.mockDataSchema,
            },
            designSystem: compressed.critical.designSystem,
            fileSystem: this.restoreFileSystem( compressed ),
            terminalLogs: this.restoreTerminalLogs( compressed ),
            healingAttempts: compressed.critical.healingAttempts,
            currentStep: this.getCurrentStep( phase ),
        };

        return state;
    }

    /**
     * Restore file system from metadata
     */
    private restoreFileSystem ( compressed: CompressedContext ): Record<string, string>
    {
        const fileSystem: Record<string, string> = {};

        // Restore recent files (full content)
        compressed.recent.currentFiles.forEach( ( file ) =>
        {
            fileSystem[ file.name ] = file.content;
        } );

        // For archived files, create placeholder content
        compressed.history.fileMetadata.forEach( ( meta ) =>
        {
            if ( !fileSystem[ meta.name ] )
            {
                fileSystem[ meta.name ] = this.createPlaceholderContent( meta );
            }
        } );

        return fileSystem;
    }

    /**
     * Create placeholder content for archived files
     */
    private createPlaceholderContent ( meta: FileMetadata ): string
    {
        const header = `// File: ${ meta.name }\n// Summary: ${ meta.summary }\n// Lines: ${ meta.lines }\n\n`;

        if ( meta.exports && meta.exports.length > 0 )
        {
            return header + meta.exports.map( exp => `export const ${ exp } = /* archived */;` ).join( '\n' );
        }

        return header + '// Content archived - use restoration service to retrieve full content';
    }

    /**
     * Restore terminal logs from compressed data
     */
    private restoreTerminalLogs ( compressed: CompressedContext ): ProjectState[ 'terminalLogs' ]
    {
        const recentErrors = compressed.recent.lastErrors;

        if ( recentErrors.length > 0 )
        {
            return {
                stdout: '',
                stderr: recentErrors[ 0 ].message,
                exitCode: 1,
            };
        }

        return undefined;
    }

    /**
     * Get current step based on phase
     */
    private getCurrentStep ( phase: ProjectPhase ): number
    {
        const phaseStepMap: Record<ProjectPhase, number> = {
            planning: 1,
            designing: 2,
            architecting: 3,
            coding: 4,
            healing: 5,
            ready: 6,
        };
        return phaseStepMap[ phase ] || 0;
    }

    /**
     * Restore specific file content (if archived)
     */
    restoreFile ( compressed: CompressedContext, fileName: string ): File | null
    {
        // Check recent files first
        const recentFile = compressed.recent.currentFiles.find( f => f.name === fileName );
        if ( recentFile )
        {
            return recentFile;
        }

        // Check archived metadata
        const metadata = compressed.history.fileMetadata.find( m => m.name === fileName );
        if ( metadata )
        {
            return {
                name: metadata.name,
                language: metadata.language,
                content: this.createPlaceholderContent( metadata ),
            };
        }

        return null;
    }

    /**
     * Restore phase history details
     */
    restorePhaseHistory ( compressed: CompressedContext, phase: ProjectPhase ): PhaseSummary | null
    {
        return compressed.history.completedPhases.find( p => p.phase === phase ) || null;
    }

    /**
     * Expand log summary into detailed logs (if possible)
     */
    expandLogs ( summary: LogSummary ): string
    {
        const lines = [
            `=== Log Summary ===`,
            `Time Range: ${ summary.timeRange.start } - ${ summary.timeRange.end }`,
            `Total Entries: ${ summary.totalEntries }`,
            `Errors: ${ summary.errorCount }`,
            `Warnings: ${ summary.warningCount }`,
            ``,
            `Summary: ${ summary.summary }`,
        ];

        if ( summary.criticalErrors && summary.criticalErrors.length > 0 )
        {
            lines.push( '', '=== Critical Errors ===' );
            summary.criticalErrors.forEach( ( error, i ) =>
            {
                lines.push( `${ i + 1 }. ${ error }` );
            } );
        }

        return lines.join( '\n' );
    }

    /**
     * Restore context for specific phase with phase-specific data
     */
    restoreForPhase ( compressed: CompressedContext, phase: ProjectPhase ): ProjectState
    {
        const baseState = this.restore( compressed, phase );
        const preservation = getPhasePreservation( phase );

        // Add phase-specific enhancements
        switch ( phase )
        {
            case 'planning':
                // Ensure plan data is complete
                break;
            case 'designing':
                // Ensure design system is complete
                break;
            case 'architecting':
                // Ensure file structure is complete
                break;
            case 'coding':
                // Ensure files are available
                break;
            case 'healing':
                // Ensure error context is complete
                if ( compressed.recent.lastErrors.length > 0 )
                {
                    baseState.terminalLogs = {
                        stdout: '',
                        stderr: compressed.recent.lastErrors.map( e => e.message ).join( '\n' ),
                        exitCode: 1,
                    };
                }
                break;
            case 'ready':
                // Ensure final state is complete
                break;
        }

        return baseState;
    }

    /**
     * Get restoration statistics
     */
    getRestorationStats ( compressed: CompressedContext ):
        {
            totalFiles: number;
            restoredFiles: number;
            archivedFiles: number;
            unresolvedIssues: number;
        }
    {
        return {
            totalFiles: compressed.recent.currentFiles.length + compressed.history.fileMetadata.length,
            restoredFiles: compressed.recent.currentFiles.length,
            archivedFiles: compressed.history.fileMetadata.length,
            unresolvedIssues: compressed.critical.unresolvedIssues.length,
        };
    }
}

// Export singleton instance
export const contextRestoration = new ContextRestorationService();
