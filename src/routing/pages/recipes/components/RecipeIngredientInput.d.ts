export interface RecipeIngredientInputData {
    id: string;
    name: string;
}

export default interface IRecipeIngredientInput {
    focus(): void;
    playLeaveAnimation(): Promise<void>;
}
