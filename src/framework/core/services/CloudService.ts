import { Semaphore, after, arrayChunk, isSuccessfulResponse, map, tap } from '@noeldemartin/utils';
import { SolidContainerModel, SolidModel, SolidModelMetadata, SolidModelOperation } from 'soukai-solid';
import type { Engine } from 'soukai';
import type { ObjectsMap } from '@noeldemartin/utils';
import type { SolidModelConstructor } from 'soukai-solid';

import Auth from '@/framework/core/facades/Auth';
import Events from '@/framework/core/facades/Events';
import Files from '@/framework/core/facades/Files';
import Service from '@/framework/core/Service';
import { getLocalClass, getRemoteClass } from '@/framework/cloud/remote_helpers';
import type Authenticator from '@/framework/auth/Authenticator';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

export enum CloudStatus {
    Offline = 'offline',
    Online = 'online',
    Disconnected = 'disconnected',
    Syncing = 'syncing',
}

const MAX_REQUESTS_CHUNK_SIZE = 10;

interface State {
    autoSync: number | false;
    startupSync: boolean;
    status: CloudStatus;
    dirtyFileUrls: Set<string>;
    dirtyRemoteModels: ObjectsMap<SolidModel>;
    remoteOperationUrls: Record<string, string[]>;
}

interface ComputedState {
    dirty: boolean;
    online: boolean;
    offline: boolean;
    syncing: boolean;
    disconnected: boolean;
    pendingUpdates: ([SolidModel, SolidModelOperation[]] | string)[];
}

export interface CloudHandler<T extends SolidModel = SolidModel> {
    modelClass: SolidModelConstructor<T>;
    isReady(): boolean;
    getLocalModels(): T[];
}

export default class CloudService extends Service<State, ComputedState> {

    public static persist: Array<keyof State> = ['autoSync', 'startupSync'];

    protected handlers: CloudHandler[] = [];
    protected asyncLock: Semaphore = new Semaphore();
    protected engine: Engine | null = null;
    protected syncInterval: number | null = null;

    public async sync(): Promise<void> {
        if (!Auth.isLoggedIn())
            return;

        await this.asyncLock.run(async () => {
            const start = Date.now();

            this.status = CloudStatus.Syncing;

            // TODO subscribe to server events instead of pulling remote on every sync
            await this.pullChanges();
            await this.pushChanges();
            await this.uploadFiles();

            await after({ milliseconds: Math.max(0, 1000 - (Date.now() - start)) });
            this.status = CloudStatus.Online;
        });
    }

    public registerHandler<T extends SolidModel>(
        modelClass: SolidModelConstructor<T>,
        handler: Omit<CloudHandler<T>, 'modelClass'>,
    ): void {
        this.engine && getRemoteClass(modelClass).setEngine(this.engine);

        this.handlers.push({ modelClass, ...handler });

        modelClass.on('created', model => Auth.isLoggedIn() && handler.isReady() && this.createRemoteModel(model));
        modelClass.on('updated', model => Auth.isLoggedIn() && handler.isReady() && this.updateRemoteModel(model));
    }

    public enqueueFileUpload(url: string): void {
        this.dirtyFileUrls = tap(new Set(this.dirtyFileUrls), urls => urls.add(url));
    }

    public removeFileUpload(url: string): void {
        this.dirtyFileUrls = tap(new Set(this.dirtyFileUrls), urls => urls.delete(url));
    }

    protected async boot(): Promise<void> {
        await super.boot();

        Auth.authenticator && this.initializeEngine(Auth.authenticator);

        Events.on('login', ({ authenticator }) => this.initializeEngine(authenticator));
        Events.on('logout', () => this.setState({ status: CloudStatus.Disconnected }));
        Events.on('application-ready', async () => {
            if (!this.startupSync) {
                this.status = Auth.isLoggedIn() ? CloudStatus.Online : CloudStatus.Disconnected;

                return;
            }

            await this.sync();
        });

        this.updateSyncInterval(this.autoSync);

        // TODO listen to auth status in order to update status
        // TODO listen to network to detect offline status
    }

    protected getInitialState(): State {
        return {
            autoSync: 10,
            status: CloudStatus.Disconnected,
            startupSync: true,
            dirtyFileUrls: new Set(),
            dirtyRemoteModels: map([], 'url'),
            remoteOperationUrls: {},
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            dirty: ({ dirtyFileUrls, dirtyRemoteModels }) => dirtyFileUrls.size + dirtyRemoteModels.size > 0,
            online: ({ status }) => status === CloudStatus.Online,
            offline: ({ status }) => status === CloudStatus.Offline,
            syncing: ({ status }) => status === CloudStatus.Syncing,
            disconnected: ({ status }) => status === CloudStatus.Disconnected,
            pendingUpdates: ({ dirtyFileUrls, dirtyRemoteModels }) => {
                const pendingUpdates: Record<string, SolidModelOperation[]> = {};

                for (const remoteModel of dirtyRemoteModels.items()) {
                    const modelPendingUpdates =
                        pendingUpdates[remoteModel.url] =
                        remoteModel.operations.filter(operation => !operation.exists());

                    for (const relatedModel of remoteModel.getRelatedModels()) {
                        modelPendingUpdates.push(
                            ...(relatedModel.operations?.filter(operation => !operation.exists()) ?? []),
                        );
                    }
                }

                const pendingModelUpdates = Object.entries(pendingUpdates).reduce(
                    (pendingUpdates, [url, operations]) => {
                        const operationsMap: Record<string, SolidModelOperation[]> = {};

                        if (operations.length === 0) {
                            pendingUpdates.push([dirtyRemoteModels.get(url) as SolidModel, []]);

                            return pendingUpdates;
                        }

                        for (const operation of operations) {
                            const date = operation.date.toISOString();

                            (operationsMap[date] ??= []).push(operation);
                        }

                        Object.values(operationsMap).forEach(
                            dateOperations => pendingUpdates.push([
                            dirtyRemoteModels.get(url) as SolidModel,
                            dateOperations,
                            ]),
                        );

                        return pendingUpdates;
                    },
                    [] as [SolidModel, SolidModelOperation[]][],
                );

                return [
                    ...pendingModelUpdates,
                    ...dirtyFileUrls,
                ];
            },
        };
    }

    protected onStateUpdated(state: Partial<State>): void {
        super.onStateUpdated(state);

        if ('autoSync' in state)
            this.updateSyncInterval(state.autoSync as number | false);
    }

    protected initializeEngine(authenticator: Authenticator): void {
        this.engine = authenticator.engine;

        for (const handler of this.handlers) {
            getRemoteClass(handler.modelClass).setEngine(this.engine);
        }
    }

    protected updateSyncInterval(autoSync: number | false): void {
        if (this.syncInterval)
            clearInterval(this.syncInterval);

        this.syncInterval = autoSync
            ? window.setInterval(() => this.sync(), autoSync * 60 * 1000)
            : null;
    }

    protected async pullChanges(): Promise<void> {
        const remoteModelsArray = await this.fetchRemoteModels();
        const remoteModels = map(remoteModelsArray, 'url');
        const localModels = map(this.getLocalModels(), 'url');

        await this.synchronizeModels(localModels, remoteModels);

        this.setState({
            dirtyRemoteModels: map(remoteModels.getItems().filter(model => model.isDirty()), 'url'),
            remoteOperationUrls: remoteModels.getItems().reduce((urls, model) => {
                urls[model.url] = model
                    .getRelatedModels()
                    .map(related => related.operations ?? [])
                    .flat()
                    .map(operation => operation.url);

                return urls;
            }, {} as Record<string, string[]>),
        });
    }

    protected async pushChanges(): Promise<void> {
        const remoteModels = this.dirtyRemoteModels.getItems();

        await Promise.all(remoteModels.map(model => model.save()));

        this.setState({
            dirtyRemoteModels: map([], 'url'),
            remoteOperationUrls: remoteModels.reduce((urls, model) => {
                urls[model.url] = model
                    .getRelatedModels()
                    .map(related => related.operations ?? [])
                    .flat()
                    .map(operation => operation.url);


                return urls;
            }, this.remoteOperationUrls),
        });
    }

    protected async uploadFiles(): Promise<void> {
        const fetch = Auth.requireAuthenticator().requireAuthenticatedFetch();
        const fileUrls = new Set(this.dirtyFileUrls);

        for (const url of fileUrls) {
            const file = await Files.get(url);

            if (file) {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.mimeType },
                    body: file.blob,
                });

                if (!isSuccessfulResponse(response))
                    continue;

                await Files.delete(url);
            }

            this.removeFileUpload(url);
        }
    }

    protected async synchronizeModels(
        localModels: ObjectsMap<SolidModel>,
        remoteModels: ObjectsMap<SolidModel>,
    ): Promise<void> {
        const synchronizedModelUrls = new Set<string>();

        for (const remoteModel of remoteModels.items()) {
            const localModel = this.getLocalModel(remoteModel, localModels);

            await SolidModel.synchronize(localModel, remoteModel);
            await localModel.save();

            localModels.add(localModel);
            synchronizedModelUrls.add(localModel.url);
        }

        for (const [url, localModel] of localModels) {
            if (synchronizedModelUrls.has(url))
                continue;

            const remoteModel = this.getRemoteModel(localModel, remoteModels);

            await SolidModel.synchronize(localModel, remoteModel);

            remoteModels.add(remoteModel);
        }
    }

    protected createRemoteModel(localModel: SolidModel): void {
        const remoteModel = this.cloneLocalModel(localModel);
        const dirtyRemoteModels = map(this.dirtyRemoteModels.getItems(), 'url');

        dirtyRemoteModels.add(remoteModel);

        this.setState({ dirtyRemoteModels });
    }

    protected async updateRemoteModel(localModel: SolidModel): Promise<void> {
        const remoteModel = this.getRemoteModel(localModel, this.dirtyRemoteModels);

        await SolidModel.synchronize(localModel, remoteModel);

        if (!this.dirtyRemoteModels.hasKey(remoteModel.url)) {
            const dirtyRemoteModels = map(this.dirtyRemoteModels.getItems(), 'url');

            dirtyRemoteModels.add(remoteModel);

            this.setState({ dirtyRemoteModels });
        }
    }

    protected getLocalModel(remoteModel: SolidModel, localModels: ObjectsMap<SolidModel>): SolidModel {
        return localModels.get(remoteModel.url) ?? this.cloneRemoteModel(remoteModel);
    }

    protected getRemoteModel(localModel: SolidModel, remoteModels: ObjectsMap<SolidModel>): SolidModel {
        return remoteModels.get(localModel.url) ?? this.cloneLocalModel(localModel);
    }

    protected cloneLocalModel(localModel: SolidModel): SolidModel {
        const localClass = localModel.static();
        const remoteClass = getRemoteClass(localModel.static());

        return tap(localModel.clone({ constructors: [[localClass, remoteClass]] }), model => {
            this.cleanRemoteModel(model);
        });
    }

    protected cloneRemoteModel(remoteModel: SolidModel): SolidModel {
        const remoteClass = remoteModel.static();
        const localClass = getLocalClass(remoteClass);

        return remoteModel.clone({ constructors: [[remoteClass, localClass]] });
    }

    protected async fetchRemoteModels(): Promise<SolidModel[]> {
        const models = await Promise.all(
            this.handlers.map(async handler => {
                if (!handler.isReady())
                    return [];

                const remoteClass = getRemoteClass(handler.modelClass);
                const container = await SolidContainerModel.withEngine(
                    this.engine as Engine,
                    () => SolidContainerModel.find(remoteClass.collection),
                );

                if (!container)
                    return [];

                const remoteModels = [];
                const urlChunks = arrayChunk(
                    container.resourceUrls.filter(url => !/\.(jpe?|pn)g$/.test(url)),
                    MAX_REQUESTS_CHUNK_SIZE,
                );

                for (const urls of urlChunks) {
                    const chunkModels = await remoteClass.all({ $in: urls });

                    remoteModels.push(...chunkModels);
                }

                return remoteModels;
            }),
        );

        return models.flat();
    }

    protected getLocalModels(): Iterable<SolidModel> {
        return this.handlers.map(handler => handler.isReady() ? handler.getLocalModels() : []).flat();
    }

    protected cleanRemoteModel(remoteModel: SolidModel): void {
        const remoteOperationUrls = this.remoteOperationUrls[remoteModel.url];

        if (!remoteOperationUrls)
            return;

        const relatedModels = remoteModel
            .getRelatedModels()
            .filter(
                model =>
                    !(model instanceof SolidModelMetadata) &&
                    !(model instanceof SolidModelOperation),
            );

        for (const relatedModel of relatedModels) {
            const operations = relatedModel.operations ?? [];

            relatedModel.setRelationModels('operations', operations.filter(operation => {
                if (!remoteOperationUrls.includes(operation.url))
                    return false;

                operation.cleanDirty(true);

                return true;
            }));
            relatedModel.rebuildAttributesFromHistory();
            relatedModel.cleanDirty(true);
            relatedModel.metadata.cleanDirty(true);

            relatedModel.setRelationModels('operations', operations);
            relatedModel.rebuildAttributesFromHistory();
        }
    }

}

export default interface CloudService extends IService<State, ComputedState> {}
