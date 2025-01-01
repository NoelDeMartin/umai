import ListenersManager from '@/utils/ListenersManager';
import type { Listeners } from '@/utils/ListenersManager';

export interface TimerListener {
    onStartedRunning?(): void;
    onStoppedRunning?(): void;
    onUpdated?(): void;
}

export interface TimerJson {
    name: string;
    duration: number;
    startedAt?: number;
    pausedAt?: number;
}

export default class Timer {

    public static fromJson(json: TimerJson): Timer {
        return new Timer(json.name, json.duration, {
            startedAt: typeof json.startedAt === 'number' ? new Date(json.startedAt) : undefined,
            pausedAt: typeof json.pausedAt === 'number' ? new Date(json.pausedAt) : undefined,
        });
    }

    public readonly name: string;
    public readonly duration: number;
    private startedAt?: Date;
    private pausedAt?: Date;
    private _listeners = new ListenersManager<TimerListener>();

    constructor(name: string, duration: number, state: { startedAt?: Date; pausedAt?: Date } = {}) {
        this.name = name;
        this.duration = duration;
        this.startedAt = state.startedAt;
        this.pausedAt = state.pausedAt;
    }

    public get listeners(): Listeners<TimerListener> {
        return this._listeners;
    }

    public hasStarted(): boolean {
        return !!this.startedAt;
    }

    public isRunning(): boolean {
        return !!this.startedAt && !this.pausedAt;
    }

    public isPaused(): boolean {
        return !!this.pausedAt;
    }

    public isOverTime(): boolean {
        if (!this.hasStarted() || this.isPaused()) {
            return false;
        }

        const startedAt = this.startedAt as Date;

        return Date.now() > startedAt.getTime() + this.duration;
    }

    public getTimeLeft(from?: number): number {
        if (!this.startedAt) {
            return this.duration;
        }

        if (this.pausedAt) {
            return this.duration - Math.round(this.pausedAt.getTime() - this.startedAt.getTime());
        }

        const time = from ? from : Date.now() ;

        return this.duration - Math.round(time - this.startedAt.getTime());
    }

    public play(): void {
        if (this.isPaused()) {
            this.resume();

            return;
        }

        if (this.hasStarted()) {
            return;
        }

        this.start();
    }

    public pause(): void {
        if (this.isPaused() || !this.hasStarted()) {
            return;
        }

        this.pausedAt = new Date();

        this._listeners.emit('onUpdated');
        this._listeners.emit('onStoppedRunning');
    }

    public stop(): void {
        const wasRunning = this.isRunning();

        this.startedAt = undefined;
        this.pausedAt = undefined;

        this._listeners.emit('onUpdated');

        if (wasRunning) {
            this._listeners.emit('onStoppedRunning');
        }
    }

    public toJson(): TimerJson {
        return {
            name: this.name,
            duration: this.duration,
            startedAt: this.startedAt ? this.startedAt.getTime() : undefined,
            pausedAt: this.pausedAt ? this.pausedAt.getTime() : undefined,
        };
    }

    private start(): void {
        this.startedAt = new Date();

        this._listeners.emit('onUpdated');
        this._listeners.emit('onStartedRunning');
    }

    private resume(): void {
        this.startedAt = new Date(Date.now() - this.duration + this.getTimeLeft());
        this.pausedAt = undefined;

        this._listeners.emit('onUpdated');
        this._listeners.emit('onStartedRunning');
    }

}
