const CACHE: Record<string, unknown> = {};

export function memoize<T>(input: string, compute: (input: string) => T): T {
    return CACHE[input] as T
        ?? (CACHE[input] = compute(input)) as T;
}
