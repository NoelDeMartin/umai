export interface IRecipeInstructionStepInput {
    focus(): void;
    playLeaveAnimation(): Promise<void>;
}

export interface RecipeInstructionStepInputData {
    id: string;
    url?: string;
    description: string;
}
