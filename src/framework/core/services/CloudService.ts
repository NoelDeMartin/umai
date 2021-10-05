import { Semaphore, after, map, tap } from '@noeldemartin/utils';
import { SolidModel, SolidModelMetadata, SolidModelOperation } from 'soukai-solid';
import type { Engine } from 'soukai';
import type { ObjectsMap } from '@noeldemartin/utils';
import type { SolidModelConstructor } from 'soukai-solid';

import Auth from '@/framework/core/facades/Auth';
import Service from '@/framework/core/Service';
import Events from '@/framework/core/facades/Events';
import { getLocalClass, getRemoteClass } from '@/framework/cloud/remote_helpers';
import type Authenticator from '@/framework/auth/Authenticator';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

interface State {
    idle: boolean;
    dirtyRemoteModels: ObjectsMap<SolidModel>;
    remoteOperationUrls: Record<string, string[]>;
}

interface ComputedState {
    dirty: boolean;
    pendingUpdates: [SolidModel, SolidModelOperation[]][];
}

export interface CloudHandler<T extends SolidModel = SolidModel> {
    modelClass: SolidModelConstructor<T>;
    isReady(): boolean;
    getLocalModels(): T[];
}

export default class CloudService extends Service<State, ComputedState> {

    protected handlers: CloudHandler[] = [];
    protected asyncLock: Semaphore = new Semaphore();
    protected engine: Engine | null = null;

    public async sync(): Promise<void> {
        if (!Auth.isLoggedIn())
            return;

        await this.asyncLock.run(async () => {
            const start = Date.now();

            this.idle = false;

            // TODO subscribe to server events instead of pulling remote on every sync
            await this.pullChanges();
            await this.pushChanges();

            await after({ milliseconds: Math.max(0, 1000 - (Date.now() - start)) });
            this.idle = true;
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

    protected async boot(): Promise<void> {
        await super.boot();

        Auth.authenticator && this.initializeEngine(Auth.authenticator);

        Events.on('login', ({ authenticator }) => this.initializeEngine(authenticator));
        Events.on('application-ready', () => this.sync());

        // TODO remove polling
        setInterval(() => this.sync(), 5000);
    }

    protected getInitialState(): State {
        return {
            idle: true,
            dirtyRemoteModels: map([], 'url'),
            remoteOperationUrls: {},
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

                    if (operations.length === 0) {
                        pendingUpdates.push([dirtyRemoteModels.get(url) as SolidModel, []]);

                        return pendingUpdates;
                    }

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
        this.engine = authenticator.newEngine();

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
            this.handlers.map(handler => {
                if (!handler.isReady())
                    return [];

                const remoteClass = getRemoteClass(handler.modelClass);

                return remoteClass.all();
            }),
        );

        return models.flat();
    }

    protected getLocalModels(): Iterable<SolidModel> {
        return this.handlers.map(handler => handler.isReady() ? handler.getLocalModels() : []).flat();
    }

    protected cleanRemoteModel(remoteModel: SolidModel): void {
        if (!(remoteModel.url in this.remoteOperationUrls))
            return;

        const remoteOperationUrls = this.remoteOperationUrls[remoteModel.url];
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
