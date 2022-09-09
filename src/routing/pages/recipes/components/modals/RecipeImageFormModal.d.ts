import type { ModalComponent } from '@/framework/core/services/UIService';

import type Recipe from '@/models/Recipe';

export type IRecipeImageFormModal = ModalComponent<RecipeImageFormModalProps, RecipeImageFormModalResult>;
export type RecipeImageFormModalProps = { recipe?: Recipe | null; imageUrl?: string | null };
export type RecipeImageFormModalResult = string | null;
