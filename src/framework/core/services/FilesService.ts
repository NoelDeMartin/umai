import { openDB } from 'idb';
import { tap } from '@noeldemartin/utils';
import type { DBSchema, IDBPDatabase, IDBPTransaction } from 'idb';

import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {}

interface FilesDatabaseSchema extends DBSchema {
    files: {
        value: FileRecord;
        key: string;
    };
}

export interface FileRecord {
    url: string;
    blob: Blob;
    mimeType: string;
}

const DATABASE = 'app';
const STORE = 'files';
const CONNECTION_LIFETIME = 1000;

export default class FilesService extends Service<State> {

    protected connection?: IDBPDatabase<FilesDatabaseSchema> = undefined;
    protected connectionTimeout?: number = undefined;

    // TODO remove tmp:// files on bootup

    public async get(url: string): Promise<FileRecord | null> {
        const connection = await this.connect();
        const record = await connection.get(STORE, url);

        return record ?? null;
    }

    public async has(url: string): Promise<boolean> {
        const connection = await this.connect();
        const key = await connection.getKey(STORE, url);

        return !!key;
    }

    public async getUrls(): Promise<string[]> {
        const connection = await this.connect();

        return connection.getAllKeys(STORE);
    }

    public async store(url: string, mimeType: string, blob: Blob): Promise<void> {
        const connection = await this.connect();

        await connection.put(STORE, { url, mimeType, blob });
    }

    public async rename(url: string, newUrl: string): Promise<void> {
        const transaction = await this.transaction('readwrite');
        const record = await transaction.store.get(url);

        if (record) {
            record.url = newUrl;

            transaction.store.delete(url);
            transaction.store.put(record);
        }

        await transaction.done;
    }

    public async delete(url: string): Promise<void> {
        const connection = await this.connect();

        await connection.delete(STORE, url);
    }

    public async deleteAll(): Promise<void> {
        const transaction = await this.transaction('readwrite');
        const urls = await transaction.store.getAllKeys();

        await Promise.all(urls.map(url => transaction.store.delete(url)));
        await transaction.done;
    }

    protected async boot(): Promise<void> {
        await super.boot();

        Events.on('logout', () => this.deleteAll());
    }

    protected async transaction<Mode extends IDBTransactionMode>(
        mode: Mode,
    ): Promise<IDBPTransaction<FilesDatabaseSchema, ['files'], Mode>> {
        const connection = await this.connect();

        return connection.transaction(STORE, mode);
    }

    protected async connect(): Promise<IDBPDatabase<FilesDatabaseSchema>> {
        const connection = this.connection ?? await this.openDatabaseConnection();

        return tap(connection, connection => this.rememberDatabaseConnection(connection));
    }

    protected openDatabaseConnection(): Promise<IDBPDatabase<FilesDatabaseSchema>> {
        return new Promise((resolve, reject) => {
            openDB<FilesDatabaseSchema>(DATABASE, 1, {
                upgrade(db) {
                    if (db.objectStoreNames.contains(STORE)) {
                        return;
                    }

                    db.createObjectStore(STORE, { keyPath: 'url' });
                },
                blocked: () => reject(new Error(`Could not open '${DATABASE}' database because it is blocked`)),
            })
                .then(resolve)
                .catch(reject);
        });
    }

    protected rememberDatabaseConnection(connection: IDBPDatabase<FilesDatabaseSchema>): void {
        this.connectionTimeout && window.clearTimeout(this.connectionTimeout);

        this.connection = connection;
        this.connectionTimeout = window.setTimeout(() => this.forgetDatabaseConnection(), CONNECTION_LIFETIME);
    }

    protected forgetDatabaseConnection(): void {
        this.connection?.close();

        this.connection = undefined;
        this.connectionTimeout = undefined;
    }

}

export default interface FilesService extends IService<State> {}
