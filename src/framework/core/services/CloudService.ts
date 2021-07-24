import { Semaphore, arr, fail, map, tap } from '@noeldemartin/utils';
import { SolidEngine } from 'soukai-solid';
import type { ObjectsMap } from '@noeldemartin/utils';
import type { SolidModel , SolidModelConstructor , SolidModelOperation } from 'soukai-solid';

import { remote } from '@/framework/models/RemoteModel';
import Auth from '@/framework/core/facades/Auth';
import Service from '@/framework/core/Service';
import Events from '@/framework/core/facades/Events';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';
import type Authenticator from '@/framework/auth/Authenticator';

interface State {
    remoteModels: ObjectsMap<SolidModel>;
    remoteOperationUrls: Map<string, Set<string>>;
}

interface ComputedState {
    dirty: boolean;
    dirtyOperations: SolidModelOperation[];
}

export interface CloudHandler<T extends SolidModel = SolidModel> {
    modelClass: SolidModelConstructor<T>;
    getLocalModels(): T[];
    addLocalModel(model: T): void;
}

export default class CloudService extends Service<State, ComputedState> {

    protected handlers: CloudHandler[] = [];
    protected asyncLock: Semaphore = new Semaphore();
    protected localClasses: WeakMap<SolidModelConstructor, SolidModelConstructor> = new WeakMap();
    protected remoteClasses: WeakMap<SolidModelConstructor, SolidModelConstructor> = new WeakMap();
    protected engine: SolidEngine | null = null;

    public async sync(): Promise<void> {
        if (!Auth.isLoggedIn())
            return;

        await this.asyncLock.run(async () => {
            // TODO subscribe to server events instead of pulling remote on every sync
            await this.pullRemote();
            await this.pushChanges();
        });
    }

    public registerHandler<T extends SolidModel>(
        modelClass: SolidModelConstructor<T>,
        handler: Omit<CloudHandler<T>, 'modelClass'>,
    ): void {
        this.engine && this.getRemoteClass(modelClass).setEngine(this.engine);

        this.handlers.push({ modelClass, ...handler });

        modelClass.on('created', model => this.createRemoteModel(model));
        modelClass.on('updated', model => this.updateRemoteModel(model));
    }

    protected async boot(): Promise<void> {
        await super.boot();

        Auth.authenticator && this.initializeEngine(Auth.authenticator);

        Events.on('login', ({ authenticator }) => this.initializeEngine(authenticator));
    }

    protected getInitialState(): State {
        return {
            remoteModels: map([], 'url'),
            remoteOperationUrls: new Map(),
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            dirty: (_, { dirtyOperations }) => dirtyOperations.length > 0,
            dirtyOperations: ({ remoteModels }) => remoteModels.getItems().reduce(
                (operations, model) => operations.concat(arr(model.operations).where('isDirty').toArray()),
                [] as SolidModelOperation[],
            ),
        };
    }

    protected initializeEngine(authenticator: Authenticator): void {
        this.engine = new SolidEngine(authenticator.requireAuthenticatedFetch());

        for (const handler of this.handlers) {
            this.getRemoteClass(handler.modelClass).setEngine(this.engine);
        }
    }

    protected async pullRemote(): Promise<void> {
        const remoteModelsArray = await this.fetchRemoteModels();
        const remoteModels = map(remoteModelsArray, 'url');
        const localModels = map(this.getLocalModels(), 'url');

        await this.mergeModels(localModels, remoteModels);

        const dirtyModels = remoteModels.getItems().filter(model => model.isDirty());
        const cleanModels = remoteModels.getItems().filter(model => !model.isDirty());

        this.setState({
            remoteOperationUrls: this.getOperationUrls(cleanModels),
            remoteModels: map(dirtyModels, 'url'),
        });
    }

    protected async pushChanges(): Promise<void> {
        await Promise.all(this.remoteModels.getItems().map(model => model.save()));

        this.setState({
            remoteOperationUrls: this.getOperationUrls(
                this.remoteModels.getItems(),
                this.remoteOperationUrls,
            ),
            remoteModels: map([], 'url'),
        });
    }

    protected async mergeModels(
        localModels: ObjectsMap<SolidModel>,
        remoteModels: ObjectsMap<SolidModel>,
    ): Promise<void> {
        for (const remoteModel of remoteModels.items()) {
            const localModel = this.getLocalModel(remoteModel, localModels);

            localModel.rebuildAttributesFromHistory();
            remoteModel.rebuildAttributesFromHistory();

            await localModel.withoutTrackingHistory(() => localModel.save());
        }

        for (const [url, localModel] of localModels) {
            if (remoteModels.hasKey(url))
                continue;

            remoteModels.add(this.cloneLocalModel(localModel));
        }
    }

    protected joinOperations(...models: SolidModel[]): void {
        const operations = map(
            models.slice(1).reduce(
                (operations, model) => operations.concat(model.operations),
                models[0].operations,
            ),
            'url',
        );

        for (const model of models) {
            for (const [operationUrl, operation] of operations) {
                if (model.operations.some(operation => operation.url === operationUrl))
                    continue;

                model.relatedOperations.add(operation.clone());
            }
        }
    }

    protected createRemoteModel(localModel: SolidModel): void {
        const remoteModel = this.cloneLocalModel(localModel);
        const remoteModels = map(this.remoteModels.getItems(), 'url');

        remoteModels.add(remoteModel);

        this.setState({ remoteModels });
    }

    protected updateRemoteModel(localModel: SolidModel): void {
        const remoteModel = this.getRemoteModel(localModel);

        this.joinOperations(localModel, remoteModel);

        remoteModel.rebuildAttributesFromHistory();
    }

    protected getRemoteModel(localModel: SolidModel): SolidModel {
        if (this.remoteModels.hasKey(localModel.url))
            return this.remoteModels.get(localModel.url) as SolidModel;

        const remoteModel = this.cloneLocalModel(localModel);
        const remoteModelOperationUrls = this.remoteOperationUrls.get(localModel.url) ?? new Set();
        const remoteModelOperations = remoteModel.operations.filter(o => remoteModelOperationUrls.has(o.url));

        if (remoteModelOperations.length === 0) {
            const inceptionOperations =
                    remoteModel.operations.filter(o => o.date.getTime() === remoteModel.createdAt.getTime());

            remoteModel.setRelationModels('operations', inceptionOperations);
            remoteModel.rebuildAttributesFromHistory();
            remoteModel.setRelationModels('operations', remoteModelOperations);
        } else {
            remoteModel.setRelationModels('operations', remoteModelOperations);
            remoteModel.rebuildAttributesFromHistory();
        }

        remoteModel.cleanDirty();

        const remoteOperationUrls = new Map(this.remoteOperationUrls);
        const remoteModels = map(this.remoteModels.getItems(), 'url');

        remoteOperationUrls.delete(remoteModel.url);
        remoteModels.add(remoteModel);

        this.setState({ remoteOperationUrls, remoteModels });

        return remoteModel;
    }

    protected getLocalModel(remoteModel: SolidModel, localModels: ObjectsMap<SolidModel>): SolidModel {
        if (!localModels.hasKey(remoteModel.url))
            return tap(this.cloneRemoteModel(remoteModel), localModel => this.addLocalModel(localModel));

        const localModel = localModels.require(remoteModel.url);

        this.joinOperations(localModel, remoteModel);

        return localModel;
    }

    protected cloneLocalModel(localModel: SolidModel): SolidModel {
        const remoteClass = this.getRemoteClass(localModel.static());

        return localModel.clone(remoteClass);
    }

    protected cloneRemoteModel(remoteModel: SolidModel): SolidModel {
        const remoteClass = remoteModel.static();
        const localClass = this.localClasses.get(remoteClass)
            ?? fail(`Couldn't find local class for ${remoteClass.modelName}`);

        return remoteModel.clone(localClass);
    }

    protected getRemoteClass(localClass: SolidModelConstructor): SolidModelConstructor {
        if (!this.remoteClasses.has(localClass)) {
            const remoteClass = remote(localClass);

            this.remoteClasses.set(localClass, remoteClass);
            this.localClasses.set(remoteClass, localClass);
        }

        return this.remoteClasses.get(localClass) as SolidModelConstructor;
    }

    protected getOperationUrls(models: SolidModel[], initial?: Map<string, Set<string>>): Map<string, Set<string>> {
        return models.reduce(
            (operationsMap, model) => tap(operationsMap, () => {
                operationsMap.set(model.url, new Set(model.operations.map(operation => operation.url)));
            }),
            new Map(initial ?? []),
        );
    }

    protected async fetchRemoteModels(): Promise<SolidModel[]> {
        const models = await Promise.all(
            this.handlers.map(handler => this.getRemoteClass(handler.modelClass).all()),
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
