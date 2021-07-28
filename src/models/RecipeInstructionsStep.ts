import Model from './RecipeInstructionsStep.schema';

export default class RecipeInstructionsStep extends Model {

    public static rdfContexts = { schema: 'https://schema.org/' };

    public static rdfsClasses = ['schema:HowToStep'];

}
