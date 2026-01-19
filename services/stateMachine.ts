import { ProjectState, ProjectPhase, ProjectConfig } from '../types';

/**
 * Formal State Machine for managing project lifecycle
 * Enforces valid phase transitions and maintains project state
 */
export class ProjectStateMachine
{
    private state: ProjectState;

    constructor( config: ProjectConfig )
    {
        this.state = this.initializeState( config );
    }

    /**
     * Initialize project state with defaults
     */
    private initializeState ( config: ProjectConfig ): ProjectState
    {
        return {
            phase: 'planning',
            plan: {
                features: config.features || [],
                fileStructure: [],
                mockDataSchema: undefined
            },
            designSystem: {
                colors: {
                    primary: '',
                    secondary: '',
                    background: '',
                    surface: '',
                    text: '',
                    accent: ''
                },
                radius: '',
                font: '',
                spacing: ''
            },
            fileSystem: {},
            terminalLogs: undefined,
            healingAttempts: 0,
            currentStep: 0
        };
    }

    /**
     * Valid state transitions map
     */
    private readonly validTransitions: Record<ProjectPhase, ProjectPhase[]> = {
        'planning': [ 'designing' ],
        'designing': [ 'architecting' ],
        'architecting': [ 'coding' ],
        'coding': [ 'ready', 'healing' ],
        'healing': [ 'coding', 'ready' ],
        'ready': []
    };

    /**
     * Attempt to transition to a new phase
     * @returns true if transition was successful, false otherwise
     */
    transition ( to: ProjectPhase ): boolean
    {
        const currentPhase = this.state.phase;
        const allowed = this.validTransitions[ currentPhase ];

        if ( allowed && allowed.includes( to ) )
        {
            this.state.phase = to;
            console.log( `[StateMachine] Transitioned: ${ currentPhase } → ${ to }` );
            return true;
        }

        console.warn( `[StateMachine] Invalid transition: ${ currentPhase } → ${ to }` );
        return false;
    }

    /**
     * Get current project state (immutable copy)
     */
    getState (): Readonly<ProjectState>
    {
        return JSON.parse( JSON.stringify( this.state ) );
    }

    /**
     * Get current phase
     */
    getCurrentPhase (): ProjectPhase
    {
        return this.state.phase;
    }

    /**
     * Update plan details
     */
    updatePlan ( plan: Partial<ProjectState[ 'plan' ]> ): void
    {
        this.state.plan = { ...this.state.plan, ...plan };
        console.log( '[StateMachine] Plan updated:', plan );
    }

    /**
     * Update design system
     */
    updateDesignSystem ( design: Partial<ProjectState[ 'designSystem' ]> ): void
    {
        this.state.designSystem = { ...this.state.designSystem, ...design };
        console.log( '[StateMachine] Design system updated' );
    }

    /**
     * Add or update a file in the file system
     */
    addFile ( path: string, content: string ): void
    {
        this.state.fileSystem[ path ] = content;
        console.log( `[StateMachine] File added/updated: ${ path }` );
    }

    /**
     * Get all files
     */
    getFiles (): Record<string, string>
    {
        return { ...this.state.fileSystem };
    }

    /**
     * Set terminal logs (for healing phase)
     */
    setTerminalLogs ( logs: ProjectState[ 'terminalLogs' ] ): void
    {
        this.state.terminalLogs = logs;
        if ( logs?.stderr )
        {
            console.error( '[StateMachine] Error logs captured:', logs.stderr );
        }
    }

    /**
     * Increment healing attempts
     */
    incrementHealingAttempts (): number
    {
        this.state.healingAttempts++;
        return this.state.healingAttempts;
    }

    /**
     * Reset healing attempts
     */
    resetHealingAttempts (): void
    {
        this.state.healingAttempts = 0;
    }

    /**
     * Update current step
     */
    setCurrentStep ( step: number ): void
    {
        this.state.currentStep = step;
    }

    /**
     * Check if mock data file exists
     */
    hasMockData (): boolean
    {
        return 'src/lib/mockData.ts' in this.state.fileSystem ||
            'lib/mockData.ts' in this.state.fileSystem ||
            'mockData.ts' in this.state.fileSystem;
    }

    /**
     * Validate that mock data exists and is realistic
     */
    validateMockData (): { valid: boolean; error?: string }
    {
        if ( !this.hasMockData() )
        {
            return {
                valid: false,
                error: 'CRITICAL: Mock data file is missing! Must create src/lib/mockData.ts'
            };
        }

        const mockDataContent = this.state.fileSystem[ 'src/lib/mockData.ts' ] ||
            this.state.fileSystem[ 'lib/mockData.ts' ] ||
            this.state.fileSystem[ 'mockData.ts' ];

        // Check for placeholder patterns
        const placeholderPatterns = [
            /User \d+/,
            /Item \d+/,
            /Product \d+/,
            /Task \d+/,
            /Customer \d+/
        ];

        for ( const pattern of placeholderPatterns )
        {
            if ( pattern.test( mockDataContent ) )
            {
                return {
                    valid: false,
                    error: 'Mock data contains placeholders (e.g., "User 1"). Use realistic names like "Alice Johnson"!'
                };
            }
        }

        return { valid: true };
    }

    /**
     * Export state as JSON
     */
    exportState (): string
    {
        return JSON.stringify( this.state, null, 2 );
    }

    /**
     * Import state from JSON
     */
    importState ( json: string ): boolean
    {
        try
        {
            const imported = JSON.parse( json );
            this.state = imported;
            return true;
        } catch ( error )
        {
            console.error( '[StateMachine] Failed to import state:', error );
            return false;
        }
    }
}
