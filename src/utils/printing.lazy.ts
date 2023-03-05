import type Recipe from '@/models/Recipe';

export async function printRecipe(recipe: Recipe, image?: HTMLImageElement): Promise<void> {
    const { printRecipe: print } = await import('./printing');

    await print(recipe, image);
}
