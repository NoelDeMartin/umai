import Recipe from '@/models/Recipe';

export enum RecipeFixture {
    Ramen = 'ramen',
    Pisto = 'pisto',
    Unknown = 'unknown',
}

export const recipeFixtures: Record<RecipeFixture, Recipe> = {
    [RecipeFixture.Ramen]: new Recipe({
        url: `https://pod.example.com/${RecipeFixture.Ramen}`,
        name: 'Ramen',
        imageUrls: ['https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500'],
    }),
    [RecipeFixture.Pisto]: new Recipe({
        url: `https://pod.example.com/${RecipeFixture.Pisto}`,
        name: 'Pisto',
        imageUrls: ['https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=500'],
    }),
    [RecipeFixture.Unknown]: new Recipe({
        url: `https://pod.example.com/${RecipeFixture.Unknown}`,
    }),
};
