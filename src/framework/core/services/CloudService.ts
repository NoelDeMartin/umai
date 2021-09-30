import { Semaphore, map } from '@noeldemartin/utils';
import { SolidEngine, SolidModel } from 'soukai-solid';
import type { ObjectsMap } from '@noeldemartin/utils';
import type { SolidModelConstructor, SolidModelOperation } from 'soukai-solid';

import Auth from '@/framework/core/facades/Auth';
import Service from '@/framework/core/Service';
import Events from '@/framework/core/facades/Events';
import { getLocalClass, getRemoteClass } from '@/framework/cloud/remote_helpers';
import type Authenticator from '@/framework/auth/Authenticator';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

interface State {
    dirtyRemoteModels: ObjectsMap<SolidModel>;
    remoteModelHistoryHashes: Record<string, string | null>;
}

interface ComputedState {
    dirty: boolean;
    pendingUpdates: [SolidModel, SolidModelOperation[]][];
}

export interface CloudHandler<T extends SolidModel = SolidModel> {
    modelClass: SolidModelConstructor<T>;
    getLocalModels(): T[];
    addLocalModel(model: T): void;
}

export default class CloudService extends Service<State, ComputedState> {

    protected handlers: CloudHandler[] = [];
    protected asyncLock: Semaphore = new Semaphore();
    protected engine: SolidEngine | null = null;

    public async sync(): Promise<void> {
        if (!Auth.isLoggedIn())
            return;

        await this.asyncLock.run(async () => {
            // TODO subscribe to server events instead of pulling remote on every sync
            await this.pullChanges();
            await this.pushChanges();
        });
    }

    public registerHandler<T extends SolidModel>(
        modelClass: SolidModelConstructor<T>,
        handler: Omit<CloudHandler<T>, 'modelClass'>,
    ): void {
        this.engine && getRemoteClass(modelClass).setEngine(this.engine);

        this.handlers.push({ modelClass, ...handler });

        modelClass.on('created', model => this.createRemoteModel(model));
        modelClass.on('updated', model => this.updateRemoteModel(model));
    }

    protected async boot(): Promise<void> {
        await super.boot();

        Auth.authenticator && this.initializeEngine(Auth.authenticator);

        Events.on('login', ({ authenticator }) => this.initializeEngine(authenticator));
        Events.on('application-ready', () => this.sync());
    }

    protected getInitialState(): State {
        return {
            dirtyRemoteModels: map([], 'url'),
            remoteModelHistoryHashes: {},
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            dirty: ({ dirtyRemoteModels }) => dirtyRemoteModels.size > 0,
            pendingUpdates: ({ dirtyRemoteModels }) => {
                const pendingUpdates: Record<string, SolidModelOperation[]> = {};

                for (const remoteModel of dirtyRemoteModels.items()) {
                    pendingUpdates[remoteModel.url] = remoteModel.operations.filter(operation => !operation.exists());

                    for (const relatedModel of remoteModel.getRelatedModels()) {
                        pendingUpdates[remoteModel.url].push(
                            ...(relatedModel.operations?.filter(operation => !operation.exists()) ?? []),
                        );
                    }
                }

                return Object.entries(pendingUpdates).reduce((pendingUpdates, [url, operations]) => {
                    const operationsMap: Record<string, SolidModelOperation[]> = {};

                    for (const operation of operations) {
                        const date = operation.date.toISOString();

                        operationsMap[date] = operationsMap[date] ?? [];
                        operationsMap[date].push(operation);
                    }

                    Object.values(operationsMap).forEach(
                        dateOperations => pendingUpdates.push([
                            dirtyRemoteModels.get(url) as SolidModel,
                            dateOperations,
                        ]),
                    );

                    return pendingUpdates;
                }, [] as [SolidModel, SolidModelOperation[]][]);
            },
        };
    }

    protected initializeEngine(authenticator: Authenticator): void {
        this.engine = new SolidEngine(authenticator.requireAuthenticatedFetch());

        for (const handler of this.handlers) {
            getRemoteClass(handler.modelClass).setEngine(this.engine);
        }
    }

    protected async pullChanges(): Promise<void> {
        const remoteModelsArray = await this.fetchRemoteModels();
        const remoteModels = map(remoteModelsArray, 'url');
        const localModels = map(this.getLocalModels(), 'url');

        await this.synchronizeModels(localModels, remoteModels);

        this.setState({
            dirtyRemoteModels: map(remoteModels.getItems().filter(model => model.isDirty()), 'url'),
            remoteModelHistoryHashes: remoteModels.getItems().reduce((hashes, model) => {
                hashes[model.url] = model.getHistoryHash();

                return hashes;
            }, {} as Record<string, string | null>),
        });
    }

    protected async pushChanges(): Promise<void> {
        const remoteModels = this.dirtyRemoteModels.getItems();

        await Promise.all(remoteModels.map(model => model.save()));

        this.setState({
            dirtyRemoteModels: map([], 'url'),
            remoteModelHistoryHashes: remoteModels.reduce((hashes, model) => {
                hashes[model.url] = model.getHistoryHash();

                return hashes;
            }, this.remoteModelHistoryHashes),
        });
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

            synchronizedModelUrls.add(localModel.url);

            localModels.hasKey(localModel.url) || this.addLocalModel(localModel);
            localModels.add(localModel);
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

        return localModel.clone({ constructors: [[localClass, remoteClass]] });
    }

    protected cloneRemoteModel(remoteModel: SolidModel): SolidModel {
        const remoteClass = remoteModel.static();
        const localClass = getLocalClass(remoteClass);

        return remoteModel.clone({ constructors: [[remoteClass, localClass]] });
    }

    protected async fetchRemoteModels(): Promise<SolidModel[]> {
        const models = await Promise.all(
            this.handlers.map(handler => getRemoteClass(handler.modelClass).all()),
        );

        return models.flat();
    }

    protected getLocalModels(): Iterable<SolidModel> {
        return this.handlers.map(handler => handler.getLocalModels()).flat();
    }

    protected addLocalModel(localModel: SolidModel): void {
        const handler = this.handlers.find(handler => localModel instanceof handler.modelClass);

        if (!handler)
            throw new Error(`Missing Cloud handler for '${localModel.static('modelName')}' model`);

        handler.addLocalModel(localModel);
    }

}

export default interface CloudService extends IService<State, ComputedState> {}
