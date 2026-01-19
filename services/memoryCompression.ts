import { ProjectState, ProjectPhase, LogEntry, File } from '../types';
import
    {
        CompressionConfig,
        CompressedContext,
        FileMetadata,
        LogSummary,
        PhaseSummary,
        Issue,
        AgentAction,
        ErrorLog,
    } from '../types/compression';
import { COMPRESSION_RULES, isRecent, shouldArchive } from './compressionRules';

/**
 * Memory Compression Service
 * Intelligently compresses SharedContext data while preserving critical information
 */
export class MemoryCompressionService
{
    private config: CompressionConfig;

    constructor( config?: Partial<CompressionConfig> )
    {
        this.config = {
            maxTotalTokens: config?.maxTotalTokens || 100000,
            criticalTokenBudget: config?.criticalTokenBudget || 20000,
            recentTokenBudget: config?.recentTokenBudget || 30000,
            compressionThreshold: config?.compressionThreshold || 80, // Compress at 80%
        };
    }

    /**
     * Estimate token count for text
     * Rough estimate: 1 token ≈ 4 characters
     */
    estimateTokens ( text: string ): number
    {
        return Math.ceil( text.length / 4 );
    }

    /**
     * Estimate tokens for an object
     */
    estimateObjectTokens ( obj: any ): number
    {
        return this.estimateTokens( JSON.stringify( obj ) );
    }

    /**
     * Estimate total tokens in current context
     */
    estimateContextTokens ( state: ProjectState ): number
    {
        return this.estimateObjectTokens( state );
    }

    /**
     * Determine if compression is needed
     */
    shouldCompress ( state: ProjectState ): boolean
    {
        const currentTokens = this.estimateContextTokens( state );
        const threshold = ( this.config.maxTotalTokens * this.config.compressionThreshold ) / 100;
        return currentTokens > threshold;
    }

    /**
     * Compress context intelligently
     */
    compress ( state: ProjectState ): CompressedContext
    {
        const originalTokens = this.estimateContextTokens( state );

        // Extract critical data (NEVER compressed)
        const critical = {
            projectConfig: {
                name: state.plan?.features?.[ 0 ] || 'Project',
                description: 'Generated project',
                features: state.plan?.features || [],
                theme: 'default',
            },
            designSystem: state.designSystem || {
                colors: {},
                radius: '',
                font: '',
                spacing: '',
            },
            fileStructure: state.plan?.fileStructure || [],
            currentPhase: state.phase,
            unresolvedIssues: this.extractUnresolvedIssues( state ),
            healingAttempts: state.healingAttempts,
            mockDataSchema: state.plan?.mockDataSchema,
        };

        // Compress historical data
        const history = {
            completedPhases: this.summarizeCompletedPhases( state ),
            archivedLogs: [], // Would be populated from actual logs
            fileMetadata: this.compressFiles( Object.entries( state.fileSystem || {} ).map( ( [ name, content ] ) => ( {
                name,
                language: this.detectLanguage( name ),
                content,
            } ) ) ),
        };

        // Keep recent context uncompressed
        const recent = {
            lastActions: this.getRecentActions( state ),
            lastErrors: this.getRecentErrors( state ),
            currentFiles: this.getCurrentFiles( state ),
        };

        const compressed: CompressedContext = {
            critical,
            history,
            recent,
            meta: {
                compressedAt: new Date().toISOString(),
                originalTokens,
                compressedTokens: 0, // Will be calculated
                compressionRatio: 0,
            },
        };

        // Calculate compressed size
        const compressedTokens = this.estimateObjectTokens( compressed );
        compressed.meta.compressedTokens = compressedTokens;
        compressed.meta.compressionRatio = ( ( originalTokens - compressedTokens ) / originalTokens ) * 100;

        return compressed;
    }

    /**
     * Summarize logs into compact format
     */
    summarizeLogs ( logs: LogEntry[] ): LogSummary
    {
        if ( logs.length === 0 )
        {
            return {
                timeRange: { start: '', end: '' },
                totalEntries: 0,
                summary: 'No logs',
                errorCount: 0,
                warningCount: 0,
            };
        }

        const errors = logs.filter( ( l ) => l.type === 'error' );
        const warnings = logs.filter( ( l ) => l.type === 'warning' );
        const criticalErrors = errors.slice( 0, 3 ).map( ( e ) => e.message );

        // Group logs by agent
        const agentActions: Record<string, number> = {};
        logs.forEach( ( log ) =>
        {
            agentActions[ log.agentId ] = ( agentActions[ log.agentId ] || 0 ) + 1;
        } );

        const summary = Object.entries( agentActions )
            .map( ( [ agent, count ] ) => `${ agent }: ${ count } actions` )
            .join( ', ' );

        return {
            timeRange: {
                start: logs[ 0 ]?.timestamp || '',
                end: logs[ logs.length - 1 ]?.timestamp || '',
            },
            totalEntries: logs.length,
            summary,
            errorCount: errors.length,
            warningCount: warnings.length,
            criticalErrors: criticalErrors.length > 0 ? criticalErrors : undefined,
        };
    }

    /**
     * Compress files to metadata only
     */
    compressFiles ( files: File[] ): FileMetadata[]
    {
        return files.map( ( file ) =>
        {
            const lines = file.content.split( '\n' ).length;
            const summary = this.summarizeFileContent( file );

            return {
                name: file.name,
                language: file.language,
                size: file.content.length,
                lines,
                summary,
                exports: this.extractExports( file.content ),
                imports: this.extractImports( file.content ),
                lastModified: new Date().toISOString(),
            };
        } );
    }

    /**
     * Summarize file content
     */
    private summarizeFileContent ( file: File ): string
    {
        const lines = file.content.split( '\n' );

        // For small files, use first line as summary
        if ( lines.length < 10 )
        {
            return lines[ 0 ]?.trim() || 'Empty file';
        }

        // For larger files, create intelligent summary
        const hasComponent = file.content.includes( 'export function' ) || file.content.includes( 'export const' );
        const hasClass = file.content.includes( 'class ' );
        const hasInterface = file.content.includes( 'interface ' );

        if ( hasComponent ) return `Component with ${ lines.length } lines`;
        if ( hasClass ) return `Class definition with ${ lines.length } lines`;
        if ( hasInterface ) return `Type definitions with ${ lines.length } lines`;

        return `${ file.language } file with ${ lines.length } lines`;
    }

    /**
     * Extract exports from file content
     */
    private extractExports ( content: string ): string[]
    {
        const exports: string[] = [];
        const exportRegex = /export\s+(?:const|function|class|interface)\s+(\w+)/g;
        let match;

        while ( ( match = exportRegex.exec( content ) ) !== null )
        {
            exports.push( match[ 1 ] );
        }

        return exports;
    }

    /**
     * Extract imports from file content
     */
    private extractImports ( content: string ): string[]
    {
        const imports: string[] = [];
        const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ( ( match = importRegex.exec( content ) ) !== null )
        {
            imports.push( match[ 1 ] );
        }

        return imports;
    }

    /**
     * Detect language from filename
     */
    private detectLanguage ( filename: string ): string
    {
        const ext = filename.split( '.' ).pop()?.toLowerCase();
        const languageMap: Record<string, string> = {
            ts: 'typescript',
            tsx: 'typescript',
            js: 'javascript',
            jsx: 'javascript',
            css: 'css',
            html: 'html',
            json: 'json',
        };
        return languageMap[ ext || '' ] || 'text';
    }

    /**
     * Summarize completed phases
     */
    private summarizeCompletedPhases ( state: ProjectState ): PhaseSummary[]
    {
        const summaries: PhaseSummary[] = [];

        // This would be populated from actual phase history
        // For now, return empty array
        return summaries;
    }

    /**
     * Extract unresolved issues
     */
    private extractUnresolvedIssues ( state: ProjectState ): Issue[]
    {
        const issues: Issue[] = [];

        // Check for errors in terminal logs
        if ( state.terminalLogs?.stderr )
        {
            issues.push( {
                id: `error-${ Date.now() }`,
                type: 'error',
                message: state.terminalLogs.stderr,
                phase: state.phase,
                resolved: false,
                timestamp: new Date().toISOString(),
            } );
        }

        return issues;
    }

    /**
     * Get recent agent actions
     */
    private getRecentActions ( state: ProjectState ): AgentAction[]
    {
        // This would be populated from actual action history
        // For now, return empty array
        return [];
    }

    /**
     * Get recent errors
     */
    private getRecentErrors ( state: ProjectState ): ErrorLog[]
    {
        const errors: ErrorLog[] = [];

        if ( state.terminalLogs?.stderr )
        {
            errors.push( {
                message: state.terminalLogs.stderr,
                phase: state.phase,
                timestamp: new Date().toISOString(),
            } );
        }

        return errors.slice( 0, COMPRESSION_RULES.recentLimits.errors );
    }

    /**
     * Get current working files
     */
    private getCurrentFiles ( state: ProjectState ): File[]
    {
        const files = Object.entries( state.fileSystem || {} ).map( ( [ name, content ] ) => ( {
            name,
            language: this.detectLanguage( name ),
            content,
        } ) );

        return files.slice( 0, COMPRESSION_RULES.recentLimits.files );
    }

    /**
     * Get compression statistics
     */
    getCompressionStats ( compressed: CompressedContext ):
        {
            originalTokens: number;
            compressedTokens: number;
            savedTokens: number;
            compressionRatio: number;
        }
    {
        const { originalTokens, compressedTokens } = compressed.meta;
        return {
            originalTokens,
            compressedTokens,
            savedTokens: originalTokens - compressedTokens,
            compressionRatio: compressed.meta.compressionRatio,
        };
    }
}

// Export singleton instance
export const memoryCompression = new MemoryCompressionService();
