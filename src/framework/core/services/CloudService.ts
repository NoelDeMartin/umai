import {
    Semaphore,
    after,
    arrayChunk,
    arrayFilter,
    fail,
    isInstanceOf,
    isSuccessfulResponse,
    map,
    objectWithout,
    tap,
} from '@noeldemartin/utils';
import {
    Metadata,
    Operation,
    SolidACLAuthorization,
    SolidContainer,
    SolidDocument,
    SolidModel,
    Tombstone,
    isSolidDocumentRelation,
} from 'soukai-solid';
import type { Engine } from 'soukai';
import type { ObjectsMap, PromisedValue } from '@noeldemartin/utils';
import type { SolidDocumentPermission } from '@noeldemartin/solid-utils';
import type { SolidModelConstructor } from 'soukai-solid';

import Auth from '@/framework/core/facades/Auth';
import Cache from '@/framework/core/facades/Cache';
import Errors from '@/framework/core/facades/Errors';
import Events from '@/framework/core/facades/Events';
import Files from '@/framework/core/facades/Files';
import Network from '@/framework/core/facades/Network';
import Service from '@/framework/core/Service';
import { getLocalClass, getRemoteClass } from '@/framework/cloud/remote_helpers';
import { translate } from '@/framework/utils/translate';
import type Authenticator from '@/framework/auth/Authenticator';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import Viewer from '@/services/facades/Viewer';

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
    dirtyFileUrls: Record<string, Set<string>>;
    dirtyRemoteModels: ObjectsMap<SolidModel>;
    remoteOperationUrls: Record<string, string[]>;
    localModelUpdates: Record<string, number>;
}

interface ComputedState {
    dirty: boolean;
    online: boolean;
    offline: boolean;
    syncing: boolean;
    disconnected: boolean;
    pendingUpdates: number;
}

export interface CloudHandler<T extends SolidModel = SolidModel> {
    booted: PromisedValue<void>;
    active: boolean;
    getLocalModels(): T[];
    getLocalModelsWithRemoteFileUrls(): { model: T; remoteFileUrls: string[] }[];
    mendRemoteModel(model: T): void;
    foundModelUsingRdfAliases(): void;

    initialize?(): Promise<void>;
    beforeDeletingModel?(model: T): Promise<void>;
}

export default class CloudService extends Service<State, ComputedState> {

    public static persist: Array<keyof State> = ['autoSync', 'startupSync', 'localModelUpdates'];

    protected static sameDocumentRelations: WeakMap<typeof SolidModel, string[]> = new WeakMap();

    protected handlers: Map<SolidModelConstructor, CloudHandler> = new Map();
    protected asyncLock: Semaphore = new Semaphore();
    protected engine: Engine | null = null;
    protected syncInterval: number | null = null;

    public async sync(model?: SolidModel): Promise<void> {
        if (!Auth.isLoggedIn() || Viewer.active) {
            return;
        }

        await this.asyncLock.run(async () => {
            const start = Date.now();

            this.status = CloudStatus.Syncing;

            try {
                // TODO subscribe to server events instead of pulling remote on every sync
                await this.pullChanges(model);
                await this.pushChanges(model);
                await this.uploadFiles();

                await after({ milliseconds: Math.max(0, 1000 - (Date.now() - start)) });
            } catch (error) {
                Errors.report(error, translate('errors.sync'));
            } finally {
                this.status = CloudStatus.Online;
            }
        });
    }

    public async syncIfOnline(model?: SolidModel): Promise<void> {
        if (!Network.online) {
            return;
        }

        await this.sync(model);
    }

    public async registerHandler<T extends SolidModel>(
        modelClass: SolidModelConstructor<T>,
        handler: CloudHandler<T>,
    ): Promise<void> {
        await handler.initialize?.();

        this.engine && getRemoteClass(modelClass).setEngine(this.engine);

        this.handlers.set(modelClass, handler);

        modelClass.on('created', model => handler.active && this.createRemoteModel(model));
        modelClass.on('updated', model => handler.active && this.updateRemoteModel(model));
    }

    public enqueueFileUpload(model: SolidModel, fileUrl: string): void {
        const dirtyFileUrls = Object.assign({}, this.dirtyFileUrls);
        const modelFileUrls = dirtyFileUrls[model.url] ??= new Set();

        modelFileUrls.add(fileUrl);

        this.dirtyFileUrls = dirtyFileUrls;
    }

    public removeFileUpload(modelUrl: string, fileUrl: string): void {
        const dirtyFileUrls = Object.assign({}, this.dirtyFileUrls);
        const modelFileUrls = dirtyFileUrls[modelUrl] ??= new Set();

        modelFileUrls.delete(fileUrl);

        if (modelFileUrls.size === 0) {
            delete dirtyFileUrls[modelUrl];
        }

        this.dirtyFileUrls = dirtyFileUrls;
    }

    public onModelMoved(previousUrl: string, newUrl: string): void {
        if (!(previousUrl in this.localModelUpdates)) {
            return;
        }

        this.setState({
            localModelUpdates: {
                ...objectWithout(this.localModelUpdates, previousUrl),
                [newUrl]: this.localModelUpdates[previousUrl],
            },
        });
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Promise.all([...this.handlers.values()].map(handler => handler.booted));

        Auth.authenticator && this.initializeEngine(Auth.authenticator);

        Events.on('login', ({ authenticator }) => this.initializeEngine(authenticator));
        Events.on('logout', () => this.setState({
            status: CloudStatus.Disconnected,
            dirtyFileUrls: {},
            dirtyRemoteModels: map([], 'url'),
            remoteOperationUrls: {},
            localModelUpdates: {},
        }));
        Events.once('application-mounted', async () => {
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
            dirtyFileUrls: {},
            dirtyRemoteModels: map([], 'url'),
            remoteOperationUrls: {},
            localModelUpdates: {},
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            dirty: (_, { pendingUpdates }) => pendingUpdates > 0,
            online: ({ status }) => status === CloudStatus.Online,
            offline: ({ status }) => status === CloudStatus.Offline,
            syncing: ({ status }) => status === CloudStatus.Syncing,
            disconnected: ({ status }) => status === CloudStatus.Disconnected,
            pendingUpdates: ({ dirtyFileUrls, localModelUpdates }) => {
                const modelUpdatesCount = Object.values(localModelUpdates).reduce((total, count) => total + count, 0);
                const fileUpdatesCount = Object.values(dirtyFileUrls)
                    .reduce((total, fileUrls) => total + fileUrls.size, 0);

                return modelUpdatesCount + fileUpdatesCount;
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

        getRemoteClass(Tombstone).setEngine(this.requireEngine());

        for (const modelClass of this.handlers.keys()) {
            getRemoteClass(modelClass).setEngine(this.engine);
        }
    }

    protected requireEngine(): Engine {
        return this.engine ?? fail('Could not get required Engine');
    }

    protected updateSyncInterval(autoSync: number | false): void {
        if (this.syncInterval)
            clearInterval(this.syncInterval);

        this.syncInterval = autoSync
            ? window.setInterval(() => this.sync(), autoSync * 60 * 1000)
            : null;
    }

    protected async pullChanges(localModel?: SolidModel): Promise<void> {
        const localModels = map(localModel ? [localModel] : this.getLocalModels(), 'url');
        const remoteModelsArray = localModel
            ? await this.fetchRemoteModelsForLocal(localModel)
            : await this.fetchRemoteModels(localModels.getItems());
        const remoteModels = map(remoteModelsArray, model => {
            if (model instanceof Tombstone) {
                return model.resourceUrl;
            }

            return model.url;
        });

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

    protected async pushChanges(localModel?: SolidModel): Promise<void> {
        const fetch = Auth.requireAuthenticator().requireAuthenticatedFetch();
        const remoteModels = this.dirtyRemoteModels.getItems()
            .filter(model => !localModel || model.url === localModel.url);
        const localModelsWithRemoteFileUrls = map(this.getLocalModelsWithRemoteFileUrls(), (({ model }) => model.url));

        await Promise.all(
            remoteModels.map(async remoteModel => {
                if (remoteModel.isSoftDeleted()) {
                    const localModel = localModelsWithRemoteFileUrls.get(remoteModel.url);

                    await Promise.all(
                        localModel?.remoteFileUrls.map(url => fetch(url, { method: 'DELETE' })) ?? [],
                    );

                    if (localModel) {
                        const handler = this.handlers.get(localModel.model.static());

                        await handler?.beforeDeletingModel?.(localModel.model);
                    }

                    remoteModel.enableHistory();
                    remoteModel.enableTombstone();
                    await remoteModel.delete();
                    await localModel?.model.delete();

                    return;
                }

                await remoteModel.save();
            }),
        );

        this.setState({
            dirtyRemoteModels: localModel
                ? this.dirtyRemoteModels.filter((_, url) => url !== localModel.url)
                : map([], 'url'),
            remoteOperationUrls: remoteModels.reduce((urls, model) => {
                urls[model.url] = model
                    .getRelatedModels()
                    .map(related => related.operations ?? [])
                    .flat()
                    .map(operation => operation.url);

                return urls;
            }, this.remoteOperationUrls),
            localModelUpdates: localModel
                ? objectWithout(this.localModelUpdates, localModel.url)
                : {},
        });
    }

    protected async uploadFiles(): Promise<void> {
        const fetch = Auth.requireAuthenticator().requireAuthenticatedFetch();

        for (const [modelUrl, fileUrls] of Object.entries(this.dirtyFileUrls)) {
            for (const fileUrl of fileUrls) {
                const file = await Files.get(fileUrl);

                if (file) {
                    const response = await fetch(fileUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': file.mimeType },
                        body: file.blob,
                    });

                    if (!isSuccessfulResponse(response)) {
                        continue;
                    }

                    await Files.delete(fileUrl);
                    await Cache.replace(fileUrl, new Response(file.blob));
                    await this.updateFilePermissions(modelUrl, fileUrl);
                }

                this.removeFileUpload(modelUrl, fileUrl);
            }
        }
    }

    protected async synchronizeModels(
        localModels: ObjectsMap<SolidModel>,
        remoteModels: ObjectsMap<SolidModel>,
    ): Promise<void> {
        const synchronizedModelUrls = new Set<string>();

        for (const remoteModel of remoteModels.items()) {
            if (remoteModel instanceof Tombstone) {
                const localModel = localModels.get(remoteModel.resourceUrl);

                if (localModel) {
                    await localModel.delete();

                    synchronizedModelUrls.add(remoteModel.resourceUrl);
                }

                continue;
            }

            const localModel = this.getLocalModel(remoteModel, localModels);

            await SolidModel.synchronize(localModel, remoteModel);
            await this.reconcileInconsistencies(localModel, remoteModel);
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

        this.setState({
            dirtyRemoteModels,
            localModelUpdates: {
                ...this.localModelUpdates,
                [localModel.url]: 1,
            },
        });
    }

    protected async updateRemoteModel(localModel: SolidModel): Promise<void> {
        const remoteModel = this.getRemoteModel(localModel, this.dirtyRemoteModels);
        const modelUpdates = this.localModelUpdates[localModel.url] ?? 0;

        await SolidModel.synchronize(localModel, remoteModel);

        if (!this.dirtyRemoteModels.hasKey(remoteModel.url)) {
            const dirtyRemoteModels = map(this.dirtyRemoteModels.getItems(), 'url');

            dirtyRemoteModels.add(remoteModel);

            this.setState({ dirtyRemoteModels });
        }

        this.setState({
            localModelUpdates: localModel.isSoftDeleted()
                ? objectWithout(this.localModelUpdates, localModel.url)
                : {
                    ...this.localModelUpdates,
                    [localModel.url]: modelUpdates + 1,
                },
        });
    }

    protected async updateFilePermissions(modelUrl: string, fileUrl: string): Promise<void> {
        const model = this.findLocalModel(modelUrl);

        if (!model) {
            return;
        }

        const fileDocument = new SolidDocument({ url: fileUrl });
        const modelPermissions = await this.getModelPublicPermissions(model);
        const filePermissions = await this.getModelPublicPermissions(fileDocument);

        if (
            modelPermissions.length === filePermissions.length &&
                        !modelPermissions.some(modelPermission => !filePermissions.includes(modelPermission))
        ) {
            return;
        }

        await fileDocument.updatePublicPermissions(modelPermissions);
    }

    protected getLocalModel(remoteModel: SolidModel, localModels: ObjectsMap<SolidModel>): SolidModel {
        return localModels.get(remoteModel.url) ?? this.cloneRemoteModel(remoteModel);
    }

    protected getRemoteModel(localModel: SolidModel, remoteModels: ObjectsMap<SolidModel>): SolidModel {
        return remoteModels.get(localModel.url) ?? this.cloneLocalModel(localModel);
    }

    protected async getModelPublicPermissions(model: SolidModel): Promise<SolidDocumentPermission[]> {
        await model.fetchPublicPermissionsIfMissing();

        // TODO implement getter in soukai-solid instead
        return (model as unknown as { _publicPermissions: SolidDocumentPermission[]})._publicPermissions;
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

        for (const modelClass of this.handlers.keys()) {
            if (modelClass !== localClass) {
                continue;
            }

            this.handlers.get(modelClass)?.mendRemoteModel(remoteModel);

            break;
        }

        return remoteModel.clone({ constructors: [[remoteClass, localClass]] });
    }

    protected async fetchRemoteModels(localModels: SolidModel[]): Promise<SolidModel[]> {
        const handlersModels = await Promise.all(
            [...this.handlers.entries()].map(async ([modelClass, handler]) => {
                if (!handler.active) {
                    return [];
                }

                const remoteModels = [];
                const remoteClass = getRemoteClass(modelClass);
                const recipeContainers = new Set([remoteClass.collection]);
                const loadedContainers = new Set();

                while (recipeContainers.size > loadedContainers.size) {
                    const containerUrl = [...recipeContainers].find(url => !loadedContainers.has(url));
                    const container = await SolidContainer.withEngine(
                        this.requireEngine(),
                        () => SolidContainer.find(containerUrl),
                    );

                    loadedContainers.add(containerUrl);

                    if (!container)
                        continue;

                    const resourceUrls = container.resourceUrls.filter(url => {
                        const isContainer = url.endsWith('/');

                        if (isContainer) {
                            recipeContainers.add(url);
                        }

                        return !isContainer;
                    });
                    const urlChunks = arrayChunk(
                        resourceUrls.filter(url => !/\.(jpe?|pn)g$/.test(url)),
                        MAX_REQUESTS_CHUNK_SIZE,
                    );

                    for (const urls of urlChunks) {
                        const chunkModels = await remoteClass.all({ $in: urls });

                        if (chunkModels.some(model => model.usesRdfAliases())) {
                            handler.foundModelUsingRdfAliases();
                        }

                        remoteModels.push(...chunkModels);
                    }
                }

                return remoteModels;
            }),
        );

        return this.completeRemoteModels(localModels, handlersModels.flat());
    }

    protected async fetchRemoteModelsForLocal(localModel: SolidModel): Promise<SolidModel[]> {
        const remoteModel = await getRemoteClass(localModel.static()).find(localModel.url);

        return this.completeRemoteModels([localModel], arrayFilter([remoteModel]));
    }

    protected async completeRemoteModels(localModels: SolidModel[], remoteModels: SolidModel[]): Promise<SolidModel[]> {
        const RemoteTombstone = getRemoteClass(Tombstone);
        const remoteModelUrls = remoteModels.map(remoteModel => remoteModel.url);
        const missingModelDocumentUrls = localModels
            .filter(localModel => !remoteModelUrls.includes(localModel.url))
            .map(localModel => localModel.requireDocumentUrl());
        const tombstones = await RemoteTombstone.all({ $in: missingModelDocumentUrls });

        return remoteModels.concat(tombstones);
    }

    protected async reconcileInconsistencies(localModel: SolidModel, remoteModel: SolidModel): Promise<void> {
        localModel.rebuildAttributesFromHistory();
        localModel.setAttributes(remoteModel.getAttributes());

        this.getSameDocumentRelations(localModel.static()).forEach(relation => {
            const localRelationModels = localModel.getRelationModels(relation) ?? [];
            const remoteRelationModels = map(remoteModel.getRelationModels(relation) ?? [], 'url');

            localRelationModels.forEach(localRelatedModel => {
                if (!localRelatedModel.isRelationLoaded('operations')) {
                    return;
                }

                localRelatedModel.rebuildAttributesFromHistory();
                localRelatedModel.setAttributes(remoteRelationModels.get(localRelatedModel.url)?.getAttributes() ?? {});
            });
        });

        if (localModel.isDirty()) {
            await localModel.save();
            await SolidModel.synchronize(localModel, remoteModel);
        }
    }

    protected findLocalModel(url: string): SolidModel | null {
        const handlers = [...this.handlers.values()];

        for (const handler of handlers) {
            const model = handler.getLocalModels().find(model => model.url === url);

            if (!model) {
                continue;
            }

            return model;
        }

        return null;
    }

    protected getLocalModels(): Iterable<SolidModel> {
        return [...this.handlers.values()]
            .map(handler => handler.active ? handler.getLocalModels() : [])
            .flat();
    }

    protected getLocalModelsWithRemoteFileUrls(): Iterable<{ model: SolidModel; remoteFileUrls: string[] }> {
        return [...this.handlers.values()]
            .map(handler => handler.active ? handler.getLocalModelsWithRemoteFileUrls() : [])
            .flat();
    }

    protected getSameDocumentRelations(modelClass: typeof SolidModel): string[] {
        if (!CloudService.sameDocumentRelations.has(modelClass)) {
            CloudService.sameDocumentRelations.set(modelClass, modelClass.relations.filter(relation => {
                if (SolidModel.reservedRelations.includes(relation)) {
                    return false;
                }

                const relationInstance = modelClass.instance().requireRelation(relation);

                return isSolidDocumentRelation(relationInstance) && relationInstance.useSameDocument;
            }));
        }

        return CloudService.sameDocumentRelations.get(modelClass) ?? [];
    }

    protected cleanRemoteModel(remoteModel: SolidModel): void {
        const remoteOperationUrls = this.remoteOperationUrls[remoteModel.url];

        if (!remoteOperationUrls)
            return;

        const relatedModels = remoteModel
            .getRelatedModels()
            .filter(
                model =>
                    !isInstanceOf(model, SolidACLAuthorization) &&
                    !isInstanceOf(model, Metadata) &&
                    !isInstanceOf(model, Operation),
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
