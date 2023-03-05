import type IRecipeImage from '@/components/recipe/RecipeImage';

export default interface IRecipePage {
    getImage(): IRecipeImage | null;
    showPrimaryPanel(): Promise<void>;
    showSecondaryPanel(): Promise<void>;
}
