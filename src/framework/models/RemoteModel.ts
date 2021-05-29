import type { SolidModel, SolidModelConstructor } from 'soukai-solid';

type RemoteModel<T extends SolidModelConstructor = SolidModelConstructor> = T & { timestamps: false; history: false };

export function remote<T extends SolidModelConstructor>(modelClass: T): RemoteModel<T> {
    const ModelClass = modelClass as typeof SolidModel;

    return class extends ModelClass {

        public static timestamps = false;
        public static history = false;

    } as RemoteModel<T>;
}

export default RemoteModel;
