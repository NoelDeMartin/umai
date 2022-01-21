import type { ModalComponent } from '@/framework/core/services/UIService';

export type IRecipeImageFormModal = ModalComponent<RecipeImageFormModalProps, RecipeImageFormModalResult>;
export type RecipeImageFormModalProps = { imageUrl?: string | null };
export type RecipeImageFormModalResult = string | null;
