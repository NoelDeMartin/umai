import type { ModalComponent } from '@/framework/core/services/UIService';

export type WebImportHtmlModalComponent = ModalComponent<{ url: string }, { html: string }>;
