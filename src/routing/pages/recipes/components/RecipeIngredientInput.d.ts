export interface IRecipeIngredientInput {
    focus(): void;
    playLeaveAnimation(): Promise<void>;
}

export interface RecipeIngredientInputData {
    id: string;
    name: string;
}
