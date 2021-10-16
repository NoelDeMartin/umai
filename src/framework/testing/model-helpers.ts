import { tap, uuid } from '@noeldemartin/utils';
import { SolidModel } from 'soukai-solid';

export function fakeRemoteModel(): SolidModel {
    return tap(new SolidModel, model => {
        model.setAttribute('url', uuid());
        model.setRelationModels('operations', []);
    });
}
