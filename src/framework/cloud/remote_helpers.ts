import { bootModels } from 'soukai';
import { fail } from '@noeldemartin/utils';
import type { SolidModel, SolidModelConstructor } from 'soukai-solid';

const remoteClasses: WeakMap<SolidModelConstructor, SolidModelConstructor> = new WeakMap();
const localClasses: WeakMap<SolidModelConstructor, SolidModelConstructor> = new WeakMap();

function makeRemoteClass<T extends SolidModelConstructor>(localClass: T): T {
    const LocalClass = localClass as typeof SolidModel;
    const RemoteClass = class extends LocalClass {

        public static timestamps = false;
        public static history = false;
    
    } as T;

    remoteClasses.set(LocalClass, RemoteClass);
    localClasses.set(RemoteClass, LocalClass);

    bootModels({ [`Remote${localClass.modelName}`]: RemoteClass });

    return RemoteClass;
}

export function getLocalClass<T extends SolidModelConstructor>(remoteClass: T): T {
    return (localClasses.get(remoteClass) as T) ?? fail(`Couldn't find local class for ${remoteClass.modelName}`);
}

export function getRemoteClass<T extends SolidModelConstructor>(localClass: T): T {
    return (remoteClasses.get(localClass) as T) ?? makeRemoteClass(localClass);
}

export function setRemoteCollection(localClass: typeof SolidModel, collection: string): void {
    localClass.collection = collection;

    const remoteClass = remoteClasses.get(localClass);

    if (remoteClass) remoteClass.collection = collection;
}
