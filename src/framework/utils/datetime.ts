import { arrayFilter, isEmpty, objectWithoutEmpty, range } from '@noeldemartin/utils';

const iso8601DurationUnit = (unit: string) => `(?:(\\d+(?:(?:.|,)\\d+)?)${unit})?`;
const humanReadableDurationUnit = (unit: string) => `(?:([\\d:]+)\\s*${unit})?`;
const ISO6801_DATE_UNITS = [
    iso8601DurationUnit('Y'),
    iso8601DurationUnit('M'),
    iso8601DurationUnit('W'),
    iso8601DurationUnit('D'),
].join('');
const ISO6801_TIME_UNITS = [
    iso8601DurationUnit('H'),
    iso8601DurationUnit('M'),
    iso8601DurationUnit('S'),
].join('');
const HUMAN_READABLE_UNITS = [
    humanReadableDurationUnit('y(?:s|ears?)?'),
    humanReadableDurationUnit('months?'),
    humanReadableDurationUnit('w(?:s|eeks?)?'),
    humanReadableDurationUnit('d(?:ays?)?'),
    humanReadableDurationUnit('h(?:ours?)?'),
    humanReadableDurationUnit('m(?:in(?:s|utes?)?)?'),
    humanReadableDurationUnit('s(?:ec(?:s|onds?)?)?'),
].join('(?:\\s|,)*');
const ISO8601_DURATION_REGEXP = new RegExp(`P${ISO6801_DATE_UNITS}(?:T${ISO6801_TIME_UNITS})?`);
const HUMAN_READABLE_DURATION_REGEXP = new RegExp(HUMAN_READABLE_UNITS);

export interface ISO8601Duration {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

function parseDuration(text: string, regExp: RegExp): ISO8601Duration | null {
    const matches = text.match(regExp);

    if (!matches) {
        return null;
    }

    const rawCarryValues = range(8).map(() => [] as string[]);
    const parseValue = (index: number) => {
        const rawValue = matches[index];
        const [unitRawValue, ...unitRawCarryValues] = rawValue?.split(':').map(value => value.trim()) ?? [];
        const rawValues = arrayFilter([unitRawValue, ...rawCarryValues?.[index] ?? []]);

        if (rawValues.length === 0) {
            return null;
        }

        unitRawCarryValues.forEach((rawCarryValue, carryIndex) => {
            rawCarryValues[index + carryIndex + 1]?.push(rawCarryValue);
        });

        return rawValues
            .map(rawValue => rawValue ? parseFloat(rawValue.replace(',', '.')) : 0)
            .reduce((total, value) => total + value, 0);
    };
    const duration = objectWithoutEmpty({
        years: parseValue(1),
        months: parseValue(2),
        weeks: parseValue(3),
        days: parseValue(4),
        hours: parseValue(5),
        minutes: parseValue(6),
        seconds: parseValue(7),
    });

    return isEmpty(duration) ? null : duration;
}

export function parseHumanReadableDuration(text: string): ISO8601Duration | null {
    return parseDuration(text, HUMAN_READABLE_DURATION_REGEXP);
}

export function parseISO8601Duration(text: string): ISO8601Duration | null {
    return parseDuration(text, ISO8601_DURATION_REGEXP);
}


export function renderHumanReadableDuration(duration: ISO8601Duration): string {
    // TODO localize

    return arrayFilter([
        duration.years && (duration.years === 1 ? '1 year' : `${duration.years} years`),
        duration.months && (duration.months === 1 ? '1 month' : `${duration.months} months`),
        duration.weeks && (duration.weeks === 1 ? '1 week' : `${duration.weeks} weeks`),
        duration.days && (duration.days === 1 ? '1 day' : `${duration.days} days`),
        duration.hours && (duration.hours === 1 ? '1 hour' : `${duration.hours} hours`),
        duration.minutes && `${duration.minutes} min`,
        duration.seconds && (duration.seconds === 1 ? '1 second' : `${duration.seconds} seconds`),
    ]).join(' ');
}

export function renderISO8601Duration(duration: ISO8601Duration): string {
    const date = arrayFilter([
        duration.years && `${duration.years}Y`,
        duration.months && `${duration.months}M`,
        duration.weeks && `${duration.weeks}W`,
        duration.days && `${duration.days}D`,
    ]).join('');

    const time = arrayFilter([
        duration.hours && `${duration.hours}H`,
        duration.minutes && `${duration.minutes}M`,
        duration.seconds && `${duration.seconds}S`,
    ]).join('');

    return `P${date}${time && `T${time}`}`;
}
