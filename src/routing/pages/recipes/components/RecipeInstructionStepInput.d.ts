export interface RecipeInstructionStepInputData {
    id: string;
    url?: string;
    description: string;
}

export default interface IRecipeInstructionStepInput {
    focus(): void;
    playLeaveAnimation(): Promise<void>;
}
