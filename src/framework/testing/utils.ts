import { readFileSync } from 'fs';

export function loadFixture<T = string>(name: string): T {
    const raw = readFileSync(`${__dirname}/../../tests/fixtures/${name}`).toString();

    return /\.json(ld)$/.test(name)
        ? JSON.parse(raw) as T
        : raw as unknown as T;
}
