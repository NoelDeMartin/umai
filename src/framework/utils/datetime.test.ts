import { parseHumanReadableDuration, parseISO8601Duration, renderISO8601Duration } from './datetime';

describe('DateTime', () => {

    it('Parses human readable durations', () => {
        expect(parseHumanReadableDuration('1h30m')).toEqual({ hours: 1, minutes: 30 });
        expect(parseHumanReadableDuration('1h 30min')).toEqual({ hours: 1, minutes: 30 });
        expect(parseHumanReadableDuration('1 hour 30 minutes')).toEqual({ hours: 1, minutes: 30 });
        expect(parseHumanReadableDuration('1 hour, 30 minutes')).toEqual({ hours: 1, minutes: 30 });
        expect(parseHumanReadableDuration('10m')).toEqual({ minutes: 10 });
        expect(parseHumanReadableDuration('3 hours 20m')).toEqual({ hours: 3, minutes: 20 });
    });

    it('Parses ISO 8601 durations', () => {
        expect(parseISO8601Duration('P3Y6M4DT12H30M5S')).toEqual({
            years: 3,
            months: 6,
            days: 4,
            hours: 12,
            minutes: 30,
            seconds: 5,
        });
        expect(parseISO8601Duration('P3W')).toEqual({ weeks: 3 });
        expect(parseISO8601Duration('P1M')).toEqual({ months: 1 });
        expect(parseISO8601Duration('PT1M')).toEqual({ minutes: 1 });
        expect(parseISO8601Duration('P0D')).toEqual({ days: 0 });
        expect(parseISO8601Duration('P0.5Y')).toEqual({ years: 0.5 });
        expect(parseISO8601Duration('P0,5Y')).toEqual({ years: 0.5 });
        expect(parseISO8601Duration('P')).toBeNull();
    });

    it('Renders ISO 8601 durations', () => {
        expect(renderISO8601Duration({ days: 3 })).toEqual('P3D');
        expect(renderISO8601Duration({ hours: 3 })).toEqual('PT3H');
    });

});
