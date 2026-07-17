import { OrchestrationLoop, OrchestrationState, OrchestrationEvent, OrchestrationEventType, StageType, IOrchestrator } from './types';
import { generateMockOrchestrationLoop, initializeMockOrchestrationState } from './mock-data';

type EventListener = (event: OrchestrationEvent) => void;

class LiveOrchestrator implements IOrchestrator {
  private state: OrchestrationState;
  private listeners: Set<EventListener> = new Set();
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private loopInterval: NodeJS.Timeout | null = null;
  private currentLoopNumber: number = 1;
  private stageTimings: { [key in StageType]: number } = {
    'Collect': 500,
    'Diagnose': 1000,
    'Plan': 1000,
    'Act': 1000,
    'Observe': 500,
    'Learn': 500,
  };

  constructor() {
    this.state = initializeMockOrchestrationState();
  }

  private emit(type: OrchestrationEventType, payload?: Record<string, any>) {
    const event: OrchestrationEvent = {
      type,
      timestamp: Date.now(),
      loopId: this.state.currentLoop.id,
      loopNumber: this.state.currentLoop.loopNumber,
      payload,
    };
    this.listeners.forEach(listener => listener(event));
  }

  async startLoop(): Promise<OrchestrationLoop> {
    if (this.isRunning) {
      throw new Error('Loop already running');
    }

    this.isRunning = true;
    this.isPaused = false;

    const newLoop = generateMockOrchestrationLoop(
      this.currentLoopNumber++,
      this.currentLoopNumber % 2 === 0 ? 'recovering' : 'poor'
    );

    this.state.currentLoop = newLoop;
    this.emit('loopStarted');

    // Simulate stages running sequentially
    const stages: StageType[] = ['Collect', 'Diagnose', 'Plan', 'Act', 'Observe', 'Learn'];
    let currentTime = newLoop.startedAt;

    for (const stage of stages) {
      if (!this.isRunning) break;

      // Wait if paused
      while (this.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.emit('stageStarted', { stage });
      newLoop.currentStage = stage;

      // Simulate stage execution
      await new Promise(resolve => setTimeout(resolve, this.stageTimings[stage]));

      // Emit agent messages for certain stages
      if (stage === 'Diagnose' || stage === 'Plan') {
        const relevantMessages = newLoop.agentMessages.filter(
          m => (stage === 'Diagnose' && m.iteration === 1 && m.agent === 'Planner') ||
               (stage === 'Plan' && ['Critic', 'Workout Expert', 'Nutrition Expert'].includes(m.agent))
        );
        relevantMessages.forEach((msg, idx) => {
          setTimeout(() => {
            this.emit('agentMessage', { message: msg });
          }, idx * 300);
        });
      }

      // Emit sponsor messages
      const sponsorMsgs = newLoop.sponsorMessages.filter(m => m.stage === stage);
      sponsorMsgs.forEach((msg, idx) => {
        setTimeout(() => {
          this.emit('sponsorMessage', { message: msg });
        }, idx * 200);
      });

      newLoop.stages[stage].completedAt = currentTime + this.stageTimings[stage];
      this.emit('stageCompleted', { stage });

      currentTime += this.stageTimings[stage];
    }

    newLoop.completedAt = currentTime;
    this.state.previousLoops.unshift(newLoop);
    if (this.state.previousLoops.length > 10) {
      this.state.previousLoops.pop();
    }

    this.emit('loopCompleted');
    this.isRunning = false;

    return newLoop;
  }

  getState(): OrchestrationState {
    return this.state;
  }

  subscribeToEvents(callback: EventListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    this.isRunning = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  reset(): void {
    this.stop();
    this.currentLoopNumber = 1;
    this.state = initializeMockOrchestrationState();
  }

  startContinuousLoop(intervalMs: number = 8000): void {
    if (this.loopInterval) clearInterval(this.loopInterval);

    this.loopInterval = setInterval(async () => {
      if (!this.isRunning) {
        await this.startLoop();
      }
    }, intervalMs);
  }

  stopContinuousLoop(): void {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }
}

// ── Singleton instance (works in both client and server) ──
let orchestratorInstance: LiveOrchestrator | null = null;

export function getOrchestrator(): LiveOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new LiveOrchestrator();
  }
  return orchestratorInstance;
}

export function resetOrchestrator(): void {
  if (orchestratorInstance) {
    orchestratorInstance.reset();
  }
}

export type { LiveOrchestrator };
