import ListenersManager from '@/utils/ListenersManager';
import type { Listeners } from '@/utils/ListenersManager';

export interface TimerListener {
    onStarted?(): void;
    onStopped?(): void;
    onUpdated?(): void;
}

export interface TimerJson {
    name: string;
    duration: number;
    startedAt?: number;
}

export default class Timer {

    public static fromJson(json: TimerJson): Timer {
        return new Timer(json.name, json.duration, {
            startedAt: typeof json.startedAt === 'number' ? new Date(json.startedAt) : undefined,
        });
    }

    public readonly name: string;
    public readonly duration: number;
    private _listeners = new ListenersManager<TimerListener>();
    private _startedAt?: Date;

    constructor(name: string, duration: number, state: { startedAt?: Date } = {}) {
        this.name = name;
        this.duration = duration;
        this._startedAt = state.startedAt;
    }

    public get listeners(): Listeners<TimerListener> {
        return this._listeners;
    }

    public get startedAt(): Date | undefined {
        return this._startedAt;
    }

    public isRunning(): boolean {
        return !!this.startedAt;
    }

    public isOverTime(): boolean {
        if (!this.startedAt) {
            return false;
        }

        return Date.now() > this.startedAt.getTime() + this.duration;
    }

    public start(): void {
        this._startedAt = new Date();

        this._listeners.emit('onUpdated');
        this._listeners.emit('onStarted');
    }

    public stop(): void {
        this._startedAt = undefined;

        this._listeners.emit('onUpdated');
        this._listeners.emit('onStopped');
    }

    public toJson(): TimerJson {
        return {
            name: this.name,
            duration: this.duration,
            startedAt: this._startedAt ? this._startedAt.getTime() : undefined,
        };
    }

}
